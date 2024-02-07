import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
class Player {
  uuid: string;
  x: number = 0;
  y: number = 0;
  z: number = 0;

  constructor(socketInfo: Socket) {
    this.uuid = socketInfo.id;
  }

  update(updateData: UpdateData) {
    this.x = updateData.x;
    this.y = updateData.y;
    this.z = updateData.z;
  }
}
interface UpdateData {
  x: number;
  y: number;
  z: number;
}
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
const players: Player[] = [];

io.on("connection", (socket) => {
  const newPlayer = new Player(socket);
  players.push(newPlayer);
  io.emit("playerConnected", players);
  console.log(`Player Connected: ${socket.id}`);

  socket.on("updateData", (updateData: UpdateData) => {
    // console.log(updateData)
    const index = players.findIndex((player) => player.uuid === socket.id);
    if (index !== -1) {
      players[index].update(updateData);
      socket.broadcast.emit('playerUpdated', players[index])
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

io.listen(3000)
