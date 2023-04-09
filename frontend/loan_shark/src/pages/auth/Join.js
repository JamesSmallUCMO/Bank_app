import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { StatementService } from '../../services/StatementService';
import { AuthService } from '../../services/AuthService';
import InputWithAdornment from '../../components/InputWithAdornment';
  
const ErrorForm = props => {
    return (
        <div className="row pl-2 text-danger mt-5 text-center font-bold" style={{ height: 24 }}>
            <p>{props.error}</p>
        </div>
    );
};

function Join() {
    const [accountCreated, setAccountCreated] = useState(false);
    const [error, setError] = useState("");
    const [initialBalance, setInitialBalance] = useState("");
    const [user, setUser] = useState({ username: '', password: '' });
    
    const changeValue = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    }

    const saveInitialBalance = e => {
        e.preventDefault();

        const amount = parseFloat(initialBalance.replace(/,/g, "")); // .replace() is for any commas

        if (!isNaN(amount)) {
            const statement = {
                name: "Initial",
                amount,
                date: toYYYYMMDD(new Date()),
                planned: false,
                frequency: null
            }
        
            StatementService.createStatement(statement)
                .then(function(res) {
                    window.location.href = "/";
                })
                .catch(function() {
                    
                });
        } else {
            setError("Amount must be a valid number");
        }
    }
    
    const submitUser = (e) => {
        e.preventDefault();
        
        AuthService.createUser(user.username, user.password)
            .then(() => {
                setError("");
                setAccountCreated(true);
            })
            .catch(() => {
                setError("Error creating user, try a different username");
            });
    };

    const toYYYYMMDD = (date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${date.getFullYear()}-${month}-${day}`;
    }
    
    return (
        <div className="row justify-content-lg-center h-100 p-5">
            <div className="col-lg-5 h-100 d-flex flex-column">
                <div className="text-center lg-3 mb-4">
                    <h2>Sign up</h2>
                </div>
                <div
                    className="d-flex flex-column justify-content-center align-items-center col-12"
                    style={{ flex: 0.8 }}
                >
                    {accountCreated ? (
                        <>
                            <p className="text-center font-bold mb-5" style={{ fontSize: 18 }}>
                                Account creation is successful. 
                                To get started, enter an initial balance.
                            </p>
                            <Form onSubmit={saveInitialBalance}>
                                <div className="d-flex align-items-center">
                                    <InputWithAdornment
                                        adornment="$"
                                        onChange={e => setInitialBalance(e.target.value)}
                                        placeholder="Enter starting balance"
                                        required
                                        value={initialBalance}
                                    />
                                    <div className="text-center" style={{marginLeft: 16}}>
                                        <Button variant="primary" style={{height: 42}} type="submit">
                                            Save 
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                            <ErrorForm error={error} />
                        </>
                    ) : (
                        <>
                            <Form className="col-12" onSubmit={submitUser}>
                                <Form.Group controlId="username" style={{marginBottom: 16}}>
                                    <Form.Label style={{marginBottom: 4}}>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Username"
                                        onChange={changeValue}
                                        name="username"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="password">
                                    <Form.Label style={{marginBottom: 4}}>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="***********"
                                        onChange={changeValue}
                                        name="password"
                                        required
                                    />
                                </Form.Group>
                                <div className="mt-4 text-center">
                                    <Button variant="primary" style={{width: 100}} type="submit">
                                        Join 
                                    </Button>
                                </div>
                            </Form>
                            <ErrorForm error={error} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Join;