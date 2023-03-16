import React, { useState } from "react";
import {
    Button,
    Card,
    Checkbox,
    CheckboxProps,
    Divider,
    DropdownProps,
    Form,
    Header,
    Icon,
    Input
} from 'semantic-ui-react';
import { GptResult } from '../pages/api/mealplan';

export type Values = {
    days?: number,
    persons?: number,
    breakfast: boolean,
    lunch: boolean,
    dinner: boolean,
    preferences?: string,
    ingredients: {
        value?: string,
        days?: number
    }[]
}

const ingredientOptions = [
    { key: 'spaghetti', text: 'Spaghetti', value: 'spaghetti' },
    { key: 'egg', text: 'Æg', value: 'egg' },
    { key: 'rice', text: 'Ris', value: 'rice' },
    { key: 'tomato', text: 'Tomat', value: 'tomato' },
    { key: 'curry', text: 'Karry', value: 'curry' },
]

const modelOptions = [{key: '1', label: "GPT3", value: 'gpt3'},{key: '2', label: "DaVinci", value: 'davinci'}];

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
        preferences: undefined,
        ingredients: []
    });
    
    const [model, setModel] = useState<string>('gpt3');

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
            preferences: values.preferences,
            ingredients: values.ingredients
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

    const handleChangeIngredientValue = (data: DropdownProps, index: number) => {
        const ingredients = values.ingredients;
        const ingredient = ingredients[index];
        ingredient.value = data.value as string;
        ingredients[index] = ingredient;
        setValues({ ...values, ingredients: ingredients });
        console.log(values.ingredients)
    }

    const handleChangeIngredientDays = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const ingredients = values.ingredients;
        const ingredient = ingredients[index];
        ingredient.days = Number(event.target.value);
        ingredients[index] = ingredient;
        setValues({ ...values, ingredients: ingredients });
        console.log(values.ingredients)
    }

    const handleDeleteIngredient = (index: number) => {
        const ingredients = values.ingredients;
        ingredients.splice(index, 1);
        console.log(ingredients);
        setValues({ ...values, ingredients: ingredients });
    }

    const handleAddIngredient = () => {
        const ingredients = values.ingredients;
        ingredients.push({ value: undefined, days: undefined });
        console.log(ingredients);
        setValues({ ...values, ingredients: ingredients });
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
                    <Form.Radio label="Vegetar" checked={values.preferences === 'vegetarian'} value='vegetarian' onChange={handleChangeRadio} name="preferences" />
                    <Form.Radio label="Veganer" checked={values.preferences === 'vegan'} value='vegan' onChange={handleChangeRadio} name="preferences" />
                </Form.Group>
                <Divider></Divider>
                <Button onClick={() => handleAddIngredient()}><Icon name="plus"></Icon> Tilføj ingrediens</Button>
                {values.ingredients.length > 0 ? <Header as='h6' content="Jeg vil gerne have INGREDIENS i mindst DAGE"></Header> : <></>}
                {values.ingredients.map((ingredient, index) =>
                    <>
                        <Divider hidden></Divider>
                        <Form.Group widths={2}>
                            <Form.Select fluid label="Ingrediens" options={ingredientOptions} onChange={(_: any, props: DropdownProps) => handleChangeIngredientValue(props, index)} name="value" required/>
                            <Form.Field fluid label="Dage" type="number" control={Input} value={ingredient.days} onChange={(event: React.ChangeEvent<HTMLInputElement>, props: DropdownProps) => handleChangeIngredientDays(event, index)} name="days" required/>
                            <Button className="delete-btn" icon='trash' negative circular onClick={() => handleDeleteIngredient(index)}></Button>
                        </Form.Group>
                    </>
                    )
                }
                <Divider></Divider>  
                <Form.Field control={Button}>Opret madplan</Form.Field>
            </Form>
        </Card.Content>
    </>;
}

export default MealGenieForm;