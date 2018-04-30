import io from "socket.io";
import jwtAuth from "socketio-jwt-auth";

let socketIO = null;

const updatedChannel = {
  id: "g0",
  name: "general :rocket:",
  phoneNumbers: [
    {
      localized: "0211-97632070",
      number: "+4921197632070",
      type: "LANDLINE"
    }
  ],
  userIds: []
};

const sendChannelUpdate = socket => {
  console.log(`WS: Send channel update to ${socket.id}`);

  // send channel update to every account with id 1234567
  socketIO.to("1234567").emit("CHANNEL_UPDATE", updatedChannel); // emit message to specific room

  // send channel update to current socket
  setTimeout(() => {
    socket.emit("CHANNEL_UPDATE", updatedChannel);
  }, 2000);
};

const onDisconnect = socket => () => {
  console.log(`WS: Disconnect ${socket.id}`);
  socketIO
  .to(socket.request.user.account)
  .emit("USER_DISCONNECTED", socket.request.user);
};

const onConnect = socket => {
  console.log(`WS: Connect ${socket.id}`, socket.user);
  socket.emit("AUTH_SUCCESS", {
    user: socket.request.user
  });

  // tell everyone that user is online
  socketIO
    .to(socket.request.user.account)
    .emit("USER_CONNECTED", socket.request.user);

  // "join" account room ->  subscribe to all account events
  socket.join(socket.request.user.account);

  socket.on("disconnect", onDisconnect(socket));

  sendChannelUpdate(socket);
};

const authMiddleware = jwtAuth.authenticate(
  {
    secret: "secret", // required, used to verify the token's signature
    succeedWithoutToken: true
  },
  (payload, done) => {
    // At this point the token is already verified and we can build the userprincipal
    // unsuccessful decodes result in the connection being rejected
    console.log("WS: Auth Request: ", payload);
    if (payload && payload.sub && payload.account) {
      console.log("WS: Successfully authenticated user: ", payload);
      done(null, payload);
    } else {
      console.log("WS: Unauthenticated user connecting ");
      return done(); // in your connection handler user.logged_in will be false
    }
  }
);

export default server => {
  socketIO = io(server);
  socketIO.use(authMiddleware);
  socketIO.on("connection", onConnect);
};
