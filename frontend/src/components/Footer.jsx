import React, {useRef} from "react";
import Button from "react-bootstrap/Button";

const Footer = ({sendWord, votePhase}) => {
    const sendWordInputRef = useRef();
    return (
    <div style={{flexDirection: "row", display: "flex", justifyContent: "space-between"}}>
        <div/>
        <div>
            <input ref={sendWordInputRef}/>
            <Button onClick={() => {
                sendWord(sendWordInputRef.current.value);
                sendWordInputRef.current.value = "";
            }}>Send</Button>
        </div>
        <Button onClick={votePhase}>Stop game</Button>
    </div>
    )
};

export default Footer;
