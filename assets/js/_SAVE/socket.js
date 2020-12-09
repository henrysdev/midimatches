// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
//
// Pass the token on params as below. Or remove it
// from the params if you are not using authentication.
import { Socket } from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}});

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/3" function
// in "lib/web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket, _connect_info) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, connect to the socket:
socket.connect()

let path              = window.location.pathname.split('/')
let room_id           = path[path.length -1]
let channel           = socket.channel(`room:${room_id}`);
let textInput         = document.querySelector("#chat-input")

export let roomStartTime = 0;

// Send message events
textInput.addEventListener("keypress", (event) => {
  const loop = {
    start_timestep: 2,
    length: 8,
    timestep_slices: [
      {
        timestep: 0,
        notes: [
          {
            instrument: !!textInput ? textInput.value : 'DEFAULT',
            key: 11,
            duration: 4,
          }
        ]
      }
    ]
  };
  if(event.key === 'Enter'){
    console.log("SEND update_musician_loop", loop)
    channel.push("update_musician_loop", {
      loop: JSON.stringify(loop)
    });
    if (!!textInput && !!textInput.value) {
      textInput.value = "";
    }
  }
});

// Receive message events
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp)})
  .receive("error", resp => { console.log("Unable to join", resp)});

channel.on("init_room_client", ({start_time_utc}) => {
  roomStartTime = start_time_utc;
});

channel.on("broadcast_updated_musician_loop", payload => {
  console.log('RECV broadcast_updated_musician_loop', payload);
});

export default socket