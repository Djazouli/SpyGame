import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import Button from "react-bootstrap/Button";

const Home = () => {
    let history = useHistory();
    const [roomName, setRoomName] = useState();
    return (
    <div style={{justifyContent: 'center', textAlign: 'center'}}>
        <div>Create or join room</div>
        <input
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
        />
        <Button onClick={() => history.push(`/${roomName}`)}>
            Join or create
        </Button>
    </div>
    );
};

export default Home;
