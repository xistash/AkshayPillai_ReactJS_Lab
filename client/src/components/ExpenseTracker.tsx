import { useState, useEffect, useRef, FormEvent } from "react";
import {Container, Spinner, Alert, Table, Button, Modal, Form } from 'react-bootstrap';
import IItem from "../models/IItem";
import { addItem, getItems } from "../services/items";


const ExpenseTracker = () => {

  const [ items, setItems ] = useState<IItem[]>([] as IItem[]);
  const [ error, setError ] = useState<Error | null>( null );
  const [ loading, setLoading ] = useState<boolean>( true );
  const [show, setShow] = useState(false);

  useEffect( () => {
    const fetchItems = async () => {
        try{
            const items = await getItems();
            setItems( items );
        } catch ( error ) {
            setError( error as Error);
        } finally {
            setLoading( false );
        }
    }     

    fetchItems();
  }, [] );


  const totalByPayee = ( payee:string) => {

    let total = 0;

    for(let i = 0; i < items.length; i++) {
        if ( items[i].payeeName === payee ) {
            total += items[i].price;
        }
    }

    return total;
  };


  const differncePayment = () => {
    let rahulAmt = 0;
    let rameshAmt = 0;

    items.forEach(item => {
        if (item.payeeName === 'Rahul') {
            rahulAmt += item.price;
        } else {
            rameshAmt += item.price;
        }
    });

    return { 
        difference: Math.abs((rahulAmt - rameshAmt) / 2) , 
        payee: rahulAmt > rameshAmt ? 'Ramesh' :  'Rahul'
    };
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const payeeNameRef = useRef<HTMLSelectElement>( null );
  const productRef = useRef<HTMLInputElement>( null );
  const priceRef = useRef<HTMLInputElement>( null );

  const addExpense = async ( event : FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const expense = {
        payeeName: payeeNameRef?.current?.value as string,
        product: productRef?.current?.value as string,
        price: parseFloat(priceRef?.current?.value as string) as number,
        setDate: ((new Date()).toISOString().substring(0,10)) as string
    } as Omit<IItem, 'id'>;

    const updatedItem = await addItem( expense );
    
    setItems([
        ...items,
        updatedItem
    ]);

    handleClose();

  };

    return (
        <Container className="my-4">
        <h1>
            Expense Tracker            
        </h1>
        <Button variant="primary" onClick={handleShow} className="float-end my-4">Add Expense</Button>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add an expense</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={addExpense}>
                    <Form.Group className="mb-3" controlId="payeeName">
                        <Form.Label>Who Paid?</Form.Label>
                        <Form.Select aria-label="Payee name" ref={payeeNameRef}>
                            <option>--Select payee--</option>
                            <option value="Rahul">Rahul</option>
                            <option value="Ramesh">Ramesh</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="product">
                        <Form.Label>What for?</Form.Label>
                        <Form.Control type="text" placeholder="Enter decription" ref={productRef} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="price">
                        <Form.Label>How Much?</Form.Label>
                        <Form.Control type="number" min="0" ref={priceRef} />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="me-2">Add Expense</Button>
                    <Button variant="danger" onClick={handleClose} className="me-2">Close</Button>                    
                </Form>
            </Modal.Body>
      </Modal>
        
        {
            loading && (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )
        }
        {
            !loading && error && (
                <Alert variant="danger">{error.message}</Alert>
            )
        } 
        {
            !loading && !error && (
            <Table striped bordered hover>
                <thead>
                    <tr className="bg-secondary">
                    <th>Sr. No.</th>
                    <th>Payee</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th className="text-end">Amount</th>
                    </tr>
                </thead>
                <tbody>
                {
                    items.map (
                        (item, idx) => (
                            <tr key={item.id}>
                                <td>{idx +1}</td>
                                <td className={
                                    item.payeeName === 'Rahul' ?
                                    'bg-primary' : 'bg-info'
                                }>{item.payeeName}</td>
                                <td>{item.product}</td>
                                <td>{item.setDate}</td>
                                <td className="font-monospace text-end">&#8377;{item.price}</td>
                            </tr>
                        )
                    )
                }
                <tr>
                    <td colSpan={4} className="text-end bg-success"><strong>Total</strong></td>
                    <td className="font-monospace text-end bg-success"><strong>&#8377;{items.reduce((total,item) => total+item.price,0) }</strong></td>
                </tr>
                <tr>
                    <td colSpan={4} className="text-end bg-primary"><strong>Rahul Paid</strong></td>
                    <td className="font-monospace text-end bg-primary"><strong>&#8377;{totalByPayee('Rahul')}</strong></td>
                </tr>
                <tr>
                    <td colSpan={4} className="text-end bg-info"><strong>Ramesh Paid</strong></td>
                    <td className="font-monospace text-end bg-info"><strong>&#8377;{totalByPayee('Ramesh')}</strong></td>
                </tr>
                <tr>
                    <td colSpan={4} className="text-end bg-warning"><strong>{differncePayment().payee} has to pay </strong></td>
                    <td className="font-monospace text-end bg-warning"><strong>&#8377;{differncePayment().difference.toFixed(2)}</strong></td>
                </tr>
                </tbody>
            </Table>
            )
        }
        </Container>
    );
}

export default ExpenseTracker;