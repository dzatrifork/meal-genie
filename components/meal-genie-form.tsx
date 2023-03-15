import {
    Button,
    Card,
    Form,
    Input,
} from 'semantic-ui-react'
import React, { useState } from "react";

export type Values = {
    days?: number,
    persons?: number,
}



const MealGenieForm = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [values, setValues] = useState<Values>({
        days: undefined,
        persons: undefined
    });
    const [result, setResult] = useState<Values | null>(null);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
        event.preventDefault();
        console.log(values)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResult(values);
        setLoading(false);
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }

    return <>
        <Card.Content>
            <Form onSubmit={handleSubmit} loading={loading}>
                <Form.Group>
                    <Form.Field label="Dage" type="number" control={Input} onChange={handleChange} name="days" />
                    <Form.Field label="Personer" type="number" control={Input} onChange={handleChange} name="persons" />
                </Form.Group>
                <Form.Field control={Button}>Opret madplan</Form.Field>
            </Form>
        </Card.Content>
        <Card.Content extra>
            Resultat: {JSON.stringify(result)},
        </Card.Content>
    </>;
}

export default MealGenieForm;