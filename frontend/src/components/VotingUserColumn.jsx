import React from "react";
import {Container, Row} from 'react-bootstrap'
import Button from "react-bootstrap/Button";

const VotingUserColumn = ({user, hasVoted, votesCount, manageVote, canVote}) => (
    <Container>
        <Row style={{justifyContent: 'center', fontWeight: "bold"}}>
            {user.name}
        </Row>
        <Row style={{justifyContent: 'center'}}>{votesCount}</Row>
        <Row style={{justifyContent: 'center'}}>{hasVoted ? "Has voted" : "Hasn't voted"}</Row>
        <Row style={{justifyContent: 'center'}}> {!canVote ? <div/> : <Button onClick={() => manageVote(user.name)}>Vote</Button>}</Row>
    </Container>
);

export default VotingUserColumn;
