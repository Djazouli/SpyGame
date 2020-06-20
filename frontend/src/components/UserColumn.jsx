import React from "react";
import {Container, Row} from 'react-bootstrap'

const UserColumn = ({user, words=[]}) => (
    <Container>
        <Row style={{justifyContent: 'center', fontWeight: "bold"}}>
            {user.name}
        </Row>
        {
            words.map(
                (word, index) => (<Row key={index} style={{justifyContent: 'center',}}>{word}</Row>)
            )
        }
    </Container>
);

export default UserColumn;
