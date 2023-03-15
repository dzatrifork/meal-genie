import {
    Button,
    Card,
    Form,
    Input,
} from 'semantic-ui-react'
import React, { forwardRef, Ref, useImperativeHandle, useState } from "react";
import { GptResult } from '../pages/api/mealplan';

export type Values = {
    days?: number,
    persons?: number,
}

export interface PropsType {}

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

const IForm = (props: PropsType, ref: Ref<RefType>) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [values, setValues] = useState<Values>({
        days: undefined,
        persons: undefined
    });

    const [result, setResult] = useState<GptResult | null>(null);
    useImperativeHandle(ref, () => ({result}))


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
        event.preventDefault();
        console.log(values)
        if (values.days == null || values.persons == null) {
            setLoading(false);
            return;
        }
        const result: GptResult = await fetcher('/api/mealplan', JSON.stringify({days: values.days, persons: values.persons}));

        setResult(result);
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
    </>;
}
const MealGenieForm = forwardRef(IForm)

export default MealGenieForm;