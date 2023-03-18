import { CreateChatCompletionResponse, CreateCompletionResponse } from "openai";
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
  Input,
  Radio,
} from "semantic-ui-react";
import { IngredientsResult } from "../pages/api/mealplan/chatgpt/ingredients";
import { InitResult } from "../pages/api/mealplan/chatgpt/init";
import { PlanResult } from "../pages/api/mealplan/chatgpt/plan";
import { DavinciResult } from "../pages/api/mealplan/instructgpt/davinci";

export type Values = {
  days?: number;
  persons?: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  preferences?: string;
  ingredients: {
    value?: string;
    days?: number;
  }[];
  types: {
    value?: string;
    days?: number;
  }[];
};

const ingredientOptions = [
  { key: "spaghetti", text: "Spaghetti", value: "spaghetti" },
  { key: "egg", text: "Æg", value: "egg" },
  { key: "rice", text: "Ris", value: "rice" },
  { key: "tomato", text: "Tomat", value: "tomato" },
  { key: "curry", text: "Karry", value: "curry" },
];

const typeOptions = [
  { key: "1", text: "Thai", value: "thai food" },
  { key: "2", text: "Italiansk", value: "italian food" },
  { key: "3", text: "Fransk", value: "french food" },
  { key: "4", text: "Simremad", value: "simmer food" },
  { key: "5", text: "Fancy", value: "fancy food" },
];

export type GptResult = {
  planStr: string;
  plan: {
    day: string;
    description: string;
  }[];
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
  }[];
};

export interface PropsType {
  result: (result: GptResult | null) => void;
  loading: (result: boolean) => void;
  model: string;
}

export interface RefType {
  result: GptResult | null;
}

const fetcher = (url: string, body: string) =>
  fetch(url, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((res) => res.json());

const MealGenieForm = (props: PropsType) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [values, setValues] = useState<Values>({
    days: 5,
    persons: 2,
    breakfast: false,
    lunch: false,
    dinner: true,
    preferences: undefined,
    ingredients: [],
    types: [],
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    props.loading(true);
    props.result(null);
    event.preventDefault();
    if (values.days == null || values.persons == null) {
      setLoading(false);
      return;
    }

    const body = {
      days: values.days,
      persons: values.persons,
      breakfast: values.breakfast,
      lunch: values.lunch,
      dinner: values.dinner,
      preferences: values.preferences,
      ingredients: values.ingredients,
      types: values.types,
    };

    if (props.model === "davinci") {
      const result: DavinciResult = await fetcher(
        "/api/mealplan/instructgpt/davinci",
        JSON.stringify(body)
      ).catch((e: Error) => e);
      props.result(result);
    } else {
      const init: InitResult = await fetcher(
        "/api/mealplan/chatgpt/init",
        JSON.stringify(body)
      ).catch((e: Error) => e);

      const ingredients: Promise<IngredientsResult> = fetcher(
        "/api/mealplan/chatgpt/ingredients",
        JSON.stringify({
          messages: init.messages,
        })
      ).catch((e: Error) => {
        console.log(e);
        return null;
      });

      const plan: Promise<PlanResult> = fetcher(
        "/api/mealplan/chatgpt/plan",
        JSON.stringify({
          messages: init.messages,
        })
      ).catch((e: Error) => {
        console.log(e);
        return null;
      });

      const res = await Promise.all([ingredients, plan]).then((values) => {
        const ingredients = values[0];
        const plan = values[1];

        if (ingredients == null || plan == null) {
          props.result(null);
          return;
        }

        return {
          planStr: init.planStr,
          plan: plan.plan,
          ingredients: ingredients.ingredients,
        };
      });
      console.log(res);
      
      if (res != null) {
          props.result(res);
      }
    }
    props.loading(false);
    setLoading(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleChangeNum = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: Number(event.target.value) });
  };

  const handleChangeIngredientValue = (data: DropdownProps, index: number) => {
    const ingredients = values.ingredients;
    const ingredient = ingredients[index];
    ingredient.value = data.value as string;
    ingredients[index] = ingredient;
    setValues({ ...values, ingredients: ingredients });
    console.log(values.ingredients);
  };

  const handleChangeIngredientDays = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const ingredients = values.ingredients;
    const ingredient = ingredients[index];
    ingredient.days = Number(event.target.value);
    ingredients[index] = ingredient;
    setValues({ ...values, ingredients: ingredients });
    console.log(values.ingredients);
  };

  const handleDeleteIngredient = (index: number) => {
    const ingredients = values.ingredients;
    ingredients.splice(index, 1);
    console.log(ingredients);
    setValues({ ...values, ingredients: ingredients });
  };

  const handleAddIngredient = () => {
    const ingredients = values.ingredients;
    ingredients.push({ value: undefined, days: undefined });
    console.log(ingredients);
    setValues({ ...values, ingredients: ingredients });
  };

  const handleChangeTypeValue = (data: DropdownProps, index: number) => {
    const types = values.types;
    const type = types[index];
    type.value = data.value as string;
    types[index] = type;
    setValues({ ...values, types: types });
    console.log(values.types);
  };

  const handleChangeTypeDays = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const types = values.types;
    const type = types[index];
    type.days = Number(event.target.value);
    types[index] = type;
    setValues({ ...values, types: types });
    console.log(values.types);
  };

  const handleDeleteType = (index: number) => {
    const types = values.types;
    types.splice(index, 1);
    console.log(types);
    setValues({ ...values, types: types });
  };

  const handleAddType = () => {
    const types = values.types;
    types.push({ value: undefined, days: undefined });
    console.log(types);
    setValues({ ...values, types: types });
  };

  const handleChangeCheckbox = (
    event: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps
  ) => {
    if (data.name != null) {
      console.log(data);
      console.log(event);
      setValues({ ...values, [data.name]: data.checked });
    }
  };
  const handleChangeRadio = (
    event: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps
  ) => {
    if (data.name != null) {
      console.log(data);
      console.log(event);
      setValues({ ...values, [data.name]: data.value });
    }
  };

  return (
    <>
      <Card.Content>
        <Form onSubmit={handleSubmit} loading={loading}>
          <Form.Group widths={2}>
            <Form.Field
              label="Dage"
              type="number"
              control={Input}
              value={values.days}
              onChange={handleChangeNum}
              name="days"
              required
            />
            <Form.Field
              label="Personer"
              type="number"
              control={Input}
              value={values.persons}
              onChange={handleChangeNum}
              name="persons"
              required
            />
          </Form.Group>
          <Form.Group inline>
            <label>Hvilke måltider?</label>
            <Form.Checkbox
              label="Morgen"
              control={Checkbox}
              checked={values.breakfast}
              onChange={handleChangeCheckbox}
              name="breakfast"
            />
            <Form.Checkbox
              label="Middag"
              control={Checkbox}
              checked={values.lunch}
              onChange={handleChangeCheckbox}
              name="lunch"
            />
            <Form.Checkbox
              label="Aften"
              control={Checkbox}
              checked={values.dinner}
              onChange={handleChangeCheckbox}
              name="dinner"
            />
          </Form.Group>
          <Form.Group inline>
            <label>Særlige kostpræferencer?</label>
            <Form.Radio
              label="Ingen"
              checked={values.preferences == null}
              value={undefined}
              onChange={handleChangeRadio}
              name="preferences"
            />
            <Form.Radio
              label="Vegetar"
              checked={values.preferences === "vegetarian"}
              value="vegetarian"
              onChange={handleChangeRadio}
              name="preferences"
            />
            <Form.Radio
              label="Veganer"
              checked={values.preferences === "vegan"}
              value="vegan"
              onChange={handleChangeRadio}
              name="preferences"
            />
          </Form.Group>
          <Divider></Divider>
          <Button onClick={() => handleAddIngredient()} color='green'>
            <Icon name="plus"></Icon> Tilføj ingrediens
          </Button>
          {values.ingredients.length > 0 ? (
            <Header
              as="h6"
              content="Jeg vil gerne have INGREDIENS i mindst DAGE"
            ></Header>
          ) : (
            <></>
          )}
          {values.ingredients.map((ingredient, index) => (
            <>
              <Divider hidden></Divider>
              <Form.Group widths={2}>
                <Form.Select
                  fluid
                  label="Ingrediens"
                  options={ingredientOptions}
                  onChange={(_: any, props: DropdownProps) =>
                    handleChangeIngredientValue(props, index)
                  }
                  name="value"
                  required
                />
                <Form.Field
                  error={(ingredient.days ?? 0) > (values.days ?? 0)}
                  fluid
                  label="Dage"
                  type="number"
                  control={Input}
                  value={ingredient.days}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                    props: DropdownProps
                  ) => handleChangeIngredientDays(event, index)}
                  name="days"
                  required
                />
                <Button
                  className="delete-btn"
                  icon="x"
                  compact
                  onClick={() => handleDeleteIngredient(index)}
                ></Button>
              </Form.Group>
            </>
          ))}
          <Divider></Divider>
          <Button onClick={() => handleAddType()} color='green'>
            <Icon name="plus"></Icon>Tilføj Type
          </Button>
          {values.types.length > 0 ? (
            <Header
              as="h6"
              content="Jeg vil gerne have DAGE har TYPE ret"
            ></Header>
          ) : (
            <></>
          )}
          {values.types.map((type, index) => (
            <>
              <Divider hidden></Divider>
              <Form.Group widths={2}>
                <Form.Select
                  fluid
                  label="Type"
                  options={typeOptions}
                  onChange={(_: any, props: DropdownProps) =>
                    handleChangeTypeValue(props, index)
                  }
                  name="value"
                  required
                />
                <Form.Field
                  fluid
                  label="Dage"
                  type="number"
                  control={Input}
                  value={type.days}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                    props: DropdownProps
                  ) => handleChangeTypeDays(event, index)}
                  name="days"
                  required
                />
                <Button
                  className="delete-btn"
                  icon="x"
                  compact
                  onClick={() => handleDeleteType(index)}
                ></Button>
              </Form.Group>
            </>
          ))}
          <Divider></Divider>
          <Form.Field type="submit" control={Button} color='green'>
            Opret madplan
          </Form.Field>
        </Form>
      </Card.Content>
    </>
  );
};

export default MealGenieForm;
