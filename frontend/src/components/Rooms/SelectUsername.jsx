import React, {useRef} from "react";
import Button from "react-bootstrap/Button";

const SelectUsername = ({setUsername}) => {
    const namePickerRef = useRef();
    return <div style={{justifyContent: 'center', textAlign: 'center'}}>
        <div>Please pick an username</div>
        <input ref={namePickerRef}/>
        <Button onClick={() => setUsername(namePickerRef.current.value)}>Select name</Button>
    </div>

};

export default SelectUsername;
