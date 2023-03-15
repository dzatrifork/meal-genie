import React, { useState } from "react";
import {
    Button,
    Card,
    Form,
    Input
} from 'semantic-ui-react';
import { GptResult } from '../pages/api/mealplan';

export type Values = {
    user?: string,
    pwd?: string,
}

export interface PropsType {
  mealPlan: GptResult
}

export interface RefType {
    result: GptResult | null;
}

const fetcher = (url: string, body: string) => fetch(url, {
    method: "POST",
    body: body,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
}).then((res) => res.json())

const NemligForm = (props: PropsType) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [values, setValues] = useState<Values>({
        user: undefined,
        pwd: undefined,
    });



    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        console.log(values);
        const names = props.mealPlan.ingredients.map(i => i.navn)
        await fetcher('api/nemlig', JSON.stringify({username: values.user, password: values.pwd, productNames: names}));
        setLoading(false);
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }

    return <>
        <Card.Content>
            <Form onSubmit={handleSubmit} loading={loading}>
                <Form.Field label="Bruger" type="email" control={Input} onChange={handleChange} name="user" required/>
                <Form.Field label="Password" type="password" control={Input} onChange={handleChange} name="pwd" required/>
                <Form.Field control={Button}>Nemligfy!</Form.Field>
            </Form>
        </Card.Content>
    </>;
}

export default NemligForm;