const SocketIo = require('socket.io');

module.exports = (server) => {
    // 클라이언트와 서버 소켓간의 통신을 담당하는 io 객체
    const io = SocketIo(server,{path:"/socket.io"});


    io.on('connection', (socket) => {

        // 비 자발적으로 서버소켓이 뜮어지는 경우 발생하는 이벤트
        socket.on('disconnect', () => {
            console.log('비 정상적으로 사용자 연결이 종료되었습니다. connectionId : ', socket.id);
        })

       socket.on("broadcast", (msg) => {
           io.emit("receiveAll", msg);
       });
       socket.on("test1",async (data1, data2)=>{
           io.emit("clientEvent1",data1, data2);
       });
        socket.on("test2",async (jsonData)=>{
            io.emit("clientEvent2",jsonData.nickName, jsonData.msg);
        });
        socket.on("entry",async (channelId, nickName, msg)=>{
            // 서버소켓에서 채팅방을 채널 아이디 값으로 생성한다.
            // 동일한 채팅방이 존재하면 그냥 쓰고 없으면 채팅방이 자동으로 만들어진다.
            // socket.join(개설하려는 채팅방의 채널 아이디)
            // 현재 entry 를 호출하는 클라이언트 connectionId 를 채널에 추가한다.
            socket.join(channelId);
            // 현재 채널에 있는 클라이언트에게만 이벤트를 전송한다.
            // socket.emit(이벤트명, 데이터)
            socket.emit('entryOk',`${nickName}님으로 ${channelId}에 입장하셨습니다.`);
            // socket.to(채널아이디).emit(이벤트명, 데이터)
            socket.to(channelId).emit('entryOk',`${nickName}님이 입장하셨습니다.`);
        })
        socket.on('send',async (data) => {
            // 지정된 채팅방에 접속해 있는 클라이언트에게만 이벤트를 전송한다.
            io.to(data.channelId).emit('receiveGroupMsg',data);
        })
        socket.on('exit', async (channelId,nickName) => {
            socket.leave(channelId);
            socket.emit('leaveOk',`채팅방을 퇴장하셨습니다`);
            socket.to(channelId).emit('leaveOk',`${nickName}님이 입장하셨습니다.`);
        })
        // 연결된 소켓 제거
        socket.on('goodbye',async ()=>{
            socket.disconnect();
        })
    });

}