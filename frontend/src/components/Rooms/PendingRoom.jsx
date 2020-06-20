import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import UserColumn from "../UserColumn";
import Button from "react-bootstrap/Button";

const PendingRoom = ({userList, startGame}) => (
    <div style={{justifyContent: 'space-between', textAlign: 'center', display: "flex", height: "99vh", flexDirection: "column"}}>
        <div>
            <Container fluid>
                <Row>
                    {
                        userList.map((user, index) => <Col key={index}><UserColumn
                            user={user}
                            words={[]}
                        /></Col>)
                    }
                </Row>
            </Container>
        </div>
        <Button onClick={startGame}>Start Game</Button>
    </div>
);

export default PendingRoom;
