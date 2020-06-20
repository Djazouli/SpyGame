import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import VotingUserColumn from "../VotingUserColumn";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const VotingRoom = ({userList, votesCountMap, hasVotedMap, sendVote, confirmVote, currentUser}) => {
    const [currentVote, setCurrentVote] = useState();
    const manageVote = (vote) => {
        setCurrentVote(vote);
        sendVote(vote);
    };
    return <div style={{textAlign: "center"}}>
        <Container fluid>
            <Row>
                {userList.map(
                    (user, index) => {
                        const hasVoted = hasVotedMap[user.name] === undefined ? false : hasVotedMap[user.name];
                        const votesCount = votesCountMap[user.name] === undefined ? 0 : votesCountMap[user.name];
                        return <Col key={index}>
                            <VotingUserColumn {...{user, hasVoted, votesCount, manageVote, currentVote, canVote: !(currentVote === user.name || hasVotedMap[currentUser])}}/>
                        </Col>
                    }
                )}
            </Row>
        </Container>
        {!hasVotedMap[currentUser] && <Button onClick={() => {
            if (userList.map(user => user.name).includes(currentVote)) {
                confirmVote(currentVote);
            }
        }}>Confirm vote</Button>}
    </div>;
};

export default VotingRoom;
