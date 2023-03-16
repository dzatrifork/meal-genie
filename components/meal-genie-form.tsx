import React, { useState } from "react";
import {
    Button,
    Card,
    Checkbox,
    CheckboxProps,
    Form,
    Input,
    Label,
    Radio
} from 'semantic-ui-react';
import { GptResult } from '../pages/api/mealplan';

export type Values = {
    days?: number,
    persons?: number,
    breakfast: boolean,
    lunch: boolean,
    dinner: boolean,
    preferences?: string,
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
        days: 5,
        persons: 2,
        breakfast: false,
        lunch: false,
        dinner: true,
        preferences: undefined
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
            preferences: values.preferences
        }))
            .catch((e: Error) => e);

        props.result(result);
        props.loading(false);
        setLoading(false);
    }


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    }  
    
    const handleChangeNum = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: Number(event.target.value) });
    }

    const handleChangeCheckbox = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        if (data.name != null) {
            console.log(data)
            console.log(event)
            setValues({ ...values, [data.name]: data.checked });
        }
    }
    const handleChangeRadio = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        if (data.name != null) {
            console.log(data)
            console.log(event)
            setValues({ ...values, [data.name]: data.value });
        }
    }

    return <>
        <Card.Content>
            <Form onSubmit={handleSubmit} loading={loading}>
                <Form.Group>
                    <Form.Field label="Dage" type="number" control={Input} value={values.days} onChange={handleChangeNum} name="days" required />
                    <Form.Field label="Personer" type="number" control={Input} value={values.persons} onChange={handleChangeNum} name="persons" required />
                </Form.Group>
                <Form.Group inline>
                    <label>Hvilke måltider?</label>
                    <Form.Checkbox label="Morgen" control={Checkbox} checked={values.breakfast} onChange={handleChangeCheckbox} name="breakfast" />
                    <Form.Checkbox label="Middag" control={Checkbox} checked={values.lunch} onChange={handleChangeCheckbox} name="lunch" />
                    <Form.Checkbox label="Aften" control={Checkbox} checked={values.dinner} onChange={handleChangeCheckbox} name="dinner" />
                </Form.Group>
                <Form.Group inline>
                    <label>Særlige kostpræference?</label>
                    <Form.Radio label="Ingen" checked={values.preferences == null} value={undefined} onChange={handleChangeRadio} name="preferences" />
                    <Form.Radio label="Vegetar" checked={values.preferences === 'vegetarian'} value='vegetarian' onChange={handleChangeRadio}name="preferences" />
                    <Form.Radio label="Veganer" checked={values.preferences === 'vegan'} value='vegan' onChange={handleChangeRadio} name="preferences" />
                </Form.Group>
                <Form.Field control={Button}>Opret madplan</Form.Field>
            </Form>
        </Card.Content>
    </>;
}

export default MealGenieForm;