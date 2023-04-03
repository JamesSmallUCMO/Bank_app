import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Event} from "@mui/icons-material";
import { Modal } from '../../components/Modal';
import { StatementService } from '../../services/StatementService';

const style = {
    amount: {
        margin: 0,
        fontSize: 28,
        textAlign: "right"
    },
    buttonsWrapper: {
        width: 540, 
        margin: "24px auto 48px",
    },
    balance: {
        fontSize: 15, 
        fontWeight: "500"
    },
    date: {
        flex: 1, 
        fontSize: 15
    },
    inlineButton: {
        margin: "0 2px 0 2px",
        padding: "0 5px 0 5px",
    },
    list: {
        width: 600, 
        margin: "24px auto 48px",
        listStyleType: "none"
    },
    listItemContainer: {
        width: "100%",
        marginBottom: 8,
        border: "1px solid #0003"
    },
    listItemContent: {
        display: "flex", 
        alignItems: "center",
        padding: "2px 8px",
        left: {
            flex: 7
        },
        right: {
            flex: 3
        }
    },
    listItemHeader: {
        display: "flex", 
        padding: "2px 8px",
        borderBottom : "1px solid #0003"
    },
    planned: {
        display: "flex",
        alignItems: "center",
        icon: {
            fontSize: 16,
            marginRight: 4
        },
        frequency: {
            margin: 0,
            fontSize: 14,
            fontWeight: "bold"
        }
    }
}

function Statements() {
    const[statements, setStatement] = useState(
        []
    );
    const addStatement=(statement)=>{
        statement.date = new Date(statement.date);
        setStatement(oldStatements => [...oldStatements, statement].sort((a, b) => a.date < b.date));
    
    }
    const clearStatements=()=> {
        setStatement(oldStatements => []);
    }
    const deleteStatement=(id)=> {
        setStatement(oldStatements => {
            for (let i = 0; i < oldStatements.length; i++) {
                if (oldStatements[i].id == id) {
                    oldStatements.splice(i, 1);
                    return oldStatements;
                }
            }
            //not found, maybe error?
            return oldStatements;
        });
    }
    const ErrorForm = props => {
        let { error } = props;
    
        if (error) {
            return (<div class="row text-bold pl-2 text-danger text-bold"><p>{error}</p></div>);
        }
    };
    const[errorCreateStatement, setErrorStateCreate] = useState({
        error:'',
      });
    const[newStatement, setStatementCreate] = useState({
        name:'',
        amount:'',
        date:'',
      });
    
    const changeNewStatementValue=(e)=>{
        setStatementCreate({
         ...newStatement, [e.target.name]:e.target.value  
        });
      }

    const formatCurrency = (amt) => {
       return `${amt < 0 ? "-" : ""}$${Math.abs(amt).toFixed(2)}`;
    }
    const [createModalControls, setCreateModal] = useState({show:false});
       
    function closeModal() {
        setCreateModal ({show: false});
    }
    function openModal() {
        setCreateModal ({show: true});
    }
    const [deleteModalControls, setDeleteModal] = useState({show:false, id: null});
    function markForDelete(id) {
        setDeleteModal ({show: true, id: id});
    }
    function closeDeleteRequestModal(id) {
        setDeleteModal ({show: false, id: null});
    }
    function acceptDelete() {
        StatementService.deleteStatement(deleteModalControls.id)
        .then((res) => {
            deleteStatement(deleteModalControls.id);
            setDeleteModal ({show: false, id: null});
        });
    }
    function createNewStatement() {
        console.log(newStatement);
        StatementService.createStatement(newStatement)
            .then(function(res) {
                addStatement(res);
            })
            .then(function() {
                setCreateModal ({show: false});
            }).catch(function() {
                //TODO, error message inside Modal.
                setErrorStateCreate({"error" : "a backend error occured"});
            });
    }

    useEffect(() => {
        StatementService.getAllStatement().then(function(loadedStatements) {
            clearStatements();

            for (let i = 0; i < loadedStatements.length; i++) {
                var loadedStatement = loadedStatements[i];
                addStatement(loadedStatement);
            }
        });
    }, []);
    return (
        <div>
            <ul style={style.list}>
                {statements.map((statement, idx) => (
                    <li key={idx} style={style.listItemContainer}>
                        <div style={style.listItemHeader}>
                            <span style={style.date}>
                                {statement.date.toLocaleDateString("en-US")}
                            </span>
                            <Button type="button" variant="danger" size="sm" style={style.inlineButton} onClick={function(){markForDelete(statement.id)}}>
                                delete
                            </Button>
                        </div>
                        <div style={style.listItemContent}>
                            <div style={style.listItemContent.left}>
                                <p style={{margin: 0}}>{statement.name}</p>
                                {statement.planned ? (
                                    <div style={style.planned}>
                                        <Event style={style.planned.icon} />
                                        <p style={style.planned.frequency}>
                                            Planned: {statement.frequency}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                            <div style={style.listItemContent.right}>
                                <p style={{...style.amount, color: statement.amount < 0 ? "#f00" : "#0b0"}}>
                                    {formatCurrency(statement.amount)}
                                </p>
                            </div>
                        </div>
                    </li>     
                ))}
            </ul>
            <div style={style.buttonsWrapper}>
                <Button variant="primary" type="submit" onClick={openModal} >
                    Add Statement 
                </Button>
            </div>
            <Modal title="Add new statement" show={createModalControls.show} closeCall={closeModal} formFinish={createNewStatement}>
                <Form>
                <Form.Group controlId="formBasicStatementName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter Name" onChange = {changeNewStatementValue} name="name"/>
                </Form.Group>
                <div className="p-2"></div>
                <Form.Group controlId="formBasicStatementAmount">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control type="number" placeholder="Enter Amount" onChange = {changeNewStatementValue} name="amount"/>
                </Form.Group>
                <div className="p-2"></div>
                <Form.Group controlId="formBasicStatementDate">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" placeholder="Enter Date"  onChange = {changeNewStatementValue} name="date"/>
                </Form.Group>
                </Form>
                <ErrorForm error={errorCreateStatement.error} />
            </Modal>
            
            <Modal title="Delete this record?" show={deleteModalControls.show} closeCall={closeDeleteRequestModal} formFinish={acceptDelete}>
                are you sure you want to delete this record?
            </Modal>
        </div>
    );
}

export default Statements;