import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Quaternion } from "three";
class Player {
  uuid: string;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  rot: Quaternion = new Quaternion();
  constructor(socketInfo: Socket) {
    this.uuid = socketInfo.id;
  }

  update(updateData: UpdateData) {
    this.x = updateData.x;
    this.y = updateData.y;
    this.z = updateData.z;
    this.rot = new Quaternion(
      updateData.rot.x,
      updateData.rot.y,
      updateData.rot.z,
      updateData.rot.w
    );
  }
}
interface UpdateData {
  x: number;
  y: number;
  z: number;
  rot: Quaternion;
}
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const players: Player[] = [];

io.on("connection", (socket) => {
  const newPlayer = new Player(socket);
  players.push(newPlayer);
  io.emit("playerConnected", players);
  console.log(`Player Connected: ${socket.id}`);

  socket.on("updateData", (updateData: UpdateData) => {
    const index = players.findIndex((player) => player.uuid === socket.id);
    if (index !== -1) {
      players[index].update(updateData);
      socket.broadcast.emit("playerUpdated", players[index]);
    }
    console.log(players)
  });
  socket.on("disconnect", () => {
    const index = players.findIndex((player) => player.uuid === socket.id);
    if (index !== -1) {
      io.emit("playerDisconnected", players[index]);
      players.splice(index, 1);
      console.log(`Player Disconnected: ${socket.id}`);
    }
  });
});

io.listen(3000);
