import React, { useState } from "react";
import {
    Button,
    Card,
    Checkbox,
    CheckboxProps,
    Form,
    Input
} from 'semantic-ui-react';
import { GptResult } from '../pages/api/mealplan';

export type Values = {
    days?: number,
    persons?: number,
    breakfast: boolean,
    lunch: boolean,
    dinner: boolean,
}

export interface PropsType {
    result: (result: GptResult | null) => void
    loading: (result: boolean) => void
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

const MealGenieForm = (props: PropsType) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [values, setValues] = useState<Values>({
        days: undefined,
        persons: undefined,
        breakfast: false,
        lunch: false,
        dinner: true,
    });



    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        props.loading(true);
        event.preventDefault();
        console.log(values)
        if (values.days == null || values.persons == null) {
            setLoading(false);
            return;
        }

        const result: GptResult = await fetcher('/api/mealplan', JSON.stringify({ 
            days: values.days, 
            persons: values.persons,
            breakfast: values.breakfast,
            lunch: values.lunch,
            dinner: values.dinner,
        }))
            .catch((e: Error) => e);

        props.result(result);
        props.loading(false);
        setLoading(false);
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }

    const handleChangeCheckbox = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        if (data.name != null) {
            console.log(data)
            console.log(event)
            setValues({ ...values, [data.name]: data.checked });
        }
    }

    return <>
        <Card.Content>
            <Form onSubmit={handleSubmit} loading={loading}>
                <Form.Group>
                    <Form.Field label="Dage" type="number" control={Input} onChange={handleChange} name="days" required/>
                    <Form.Field label="Personer" type="number" control={Input} onChange={handleChange} name="persons" required/>
                </Form.Group>
                <Form.Group >                    
                    <label>Hvilke måltider?</label>
                    <Form.Checkbox label="Morgen" control={Checkbox} checked={values.breakfast} onChange={handleChangeCheckbox} name="breakfast"/>
                    <Form.Checkbox label="Middag" control={Checkbox} checked={values.lunch} onChange={handleChangeCheckbox} name="lunch"/>
                    <Form.Checkbox label="Aften" control={Checkbox} checked={values.dinner} onChange={handleChangeCheckbox} name="dinner"/>
                </Form.Group>
                <Form.Field control={Button}>Opret madplan</Form.Field>
            </Form>
        </Card.Content>
    </>;
}

export default MealGenieForm;