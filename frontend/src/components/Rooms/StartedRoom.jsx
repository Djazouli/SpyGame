import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import UserColumn from "../UserColumn";
import Footer from "../Footer";

const StartedRoom = ({word, userList, userWords, sendWord, votePhase}) => (
    <div style={{justifyContent: 'space-between', textAlign: 'center', display: "flex", height: "99vh", flexDirection: "column"}}>
        <div>
            {word && <h3>Your word: {word}</h3>}
            <Container fluid>
                <Row>
                    {
                        userList.map((user, index) => <Col key={index}><UserColumn
                            user={user}
                            words={userWords[user.name]}
                        /></Col>)
                    }
                </Row>
            </Container>
        </div>
        <Footer sendWord={sendWord} votePhase={votePhase}/>
    </div>
);

export default StartedRoom;
