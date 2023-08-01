import React from "react";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  DropdownProps,
  Form,
  Header,
  Icon,
  Input,
} from "semantic-ui-react";
import { useMealPlanStore } from "../lib/store";

const ingredientOptions = [
  { key: 0, value: "tortellini", text: "Tortellini" },
  { key: 1, value: "pasta", text: "Pasta" },
  { key: 2, value: "tomato", text: "Tomat" },
  { key: 3, value: "egg", text: "Æg" },
  { key: 4, value: "curry", text: "Karry" },
  { key: 5, value: "rice", text: "Ris" },
  { key: 6, value: "potato", text: "Kartoffel" },
  { key: 7, value: "onion", text: "Løg" },
  { key: 8, value: "garlic", text: "Hvidløg" },
  { key: 9, value: "chicken", text: "Kylling" },
  { key: 10, value: "beef", text: "Oksekød" },
  { key: 11, value: "pork", text: "Svinekød" },
  { key: 12, value: "fish", text: "Fisk" },
  { key: 13, value: "shrimp", text: "Rejer" },
  { key: 14, value: "beans", text: "Bønner" },
  { key: 15, value: "cheese", text: "Ost" },
  { key: 16, value: "bread", text: "Brød" },
  { key: 17, value: "butter", text: "Smør" },
  { key: 18, value: "oil", text: "Olie" },
  { key: 19, value: "vinegar", text: "Eddike" },
  { key: 20, value: "salt", text: "Salt" },
  { key: 21, value: "pepper", text: "Peber" },
  { key: 22, value: "sugar", text: "Sukker" },
  { key: 23, value: "flour", text: "Mel" },
  { key: 24, value: "milk", text: "Mælk" },
  { key: 25, value: "cream", text: "Fløde" },
  { key: 26, value: "yogurt", text: "Yoghurt" },
  { key: 27, value: "lemon", text: "Citron" },
  { key: 28, value: "lime", text: "Lime" },
  { key: 29, value: "orange", text: "Appelsin" },
  { key: 30, value: "apple", text: "Æble" },
  { key: 31, value: "banana", text: "Banan" },
  { key: 32, value: "strawberry", text: "Jordbær" },
  { key: 33, value: "blueberry", text: "Blåbær" },
  { key: 34, value: "raspberry", text: "Hindbær" },
  { key: 35, value: "blackberry", text: "Brombær" },
  { key: 36, value: "avocado", text: "Avocado" },
  { key: 37, value: "lettuce", text: "Salat" },
  { key: 38, value: "spinach", text: "Spinat" },
  { key: 39, value: "kale", text: "Grønkål" },
  { key: 40, value: "carrot", text: "Gulerod" },
  { key: 41, value: "celery", text: "Selleri" },
  { key: 42, value: "cucumber", text: "Agurk" },
  { key: 43, value: "bell pepper", text: "Peberfrugt" },
  { key: 44, value: "chili pepper", text: "Chilipeber" },
  { key: 45, value: "mushroom", text: "Champignon" },
  { key: 46, value: "corn", text: "Majs" },
  { key: 47, value: "peas", text: "Ærter" },
  { key: 48, value: "broccoli", text: "Broccoli" },
  { key: 49, value: "cauliflower", text: "Blomkål" },
  { key: 50, value: "zucchini", text: "Zucchini" },
  { key: 51, value: "eggplant", text: "Aubergine" },
  { key: 52, value: "pumpkin", text: "Græskar" },
  { key: 53, value: "sweet potato", text: "Søde kartoffel" },
  { key: 54, value: "soy sauce", text: "Sojasovs" },
  { key: 55, value: "hoisin sauce", text: "Hoisin sauce" },
  { key: 56, value: "fish sauce", text: "Fiskesovs" },
  { key: 57, value: "soybean oil", text: "Sojabønneolie" },
  { key: 58, value: "sesame oil", text: "Sesamolie" },
  { key: 59, value: "peanut oil", text: "Jordnøddeolie" },
  { key: 60, value: "mustard", text: "Sennep" },
  { key: 61, value: "mayonnaise", text: "Mayonnaise" },
  { key: 62, value: "ketchup", text: "Ketchup" },
  { key: 63, value: "hot sauce", text: "Chilisauce" },
  { key: 64, value: "bbq sauce", text: "BBQ-sauce" },
  { key: 65, value: "honey", text: "Honning" },
  { key: 66, value: "maple syrup", text: "Ahornsirup" },
  { key: 67, value: "cinnamon", text: "Kanel" },
  { key: 68, value: "nutmeg", text: "Muskatnød" },
  { key: 69, value: "ginger", text: "Ingefær" },
  { key: 70, value: "vanilla extract", text: "Vaniljeekstrakt" },
  { key: 71, value: "lemongrass", text: "Citrongræs" },
  { key: 72, value: "galangal", text: "Galanga" },
  { key: 73, value: "kaffir lime leaves", text: "Kaffir limeblade" },
  { key: 74, value: "Thai basil", text: "Thailandsk basilikum" },
  { key: 75, value: "fish sauce", text: "Fiskesauce" },
  { key: 76, value: "coconut milk", text: "Kokosmælk" },
  { key: 77, value: "palm sugar", text: "Palme sukker" },
  { key: 78, value: "tamarind paste", text: "Tamarind pasta" },
  { key: 79, value: "curry paste", text: "Karrypasta" },
  { key: 80, value: "rice noodles", text: "Risnudler" },
  { key: 81, value: "turmeric", text: "Gurkemeje" },
  { key: 82, value: "cumin", text: "Spidskommen" },
  { key: 83, value: "coriander", text: "Koriander" },
  { key: 84, value: "garam masala", text: "Garam masala" },
  { key: 85, value: "cardamom", text: "Kardemomme" },
  { key: 86, value: "fenugreek", text: "Bukkehornsfrø" },
  { key: 87, value: "mustard seeds", text: "Sennepsfrø" },
  { key: 88, value: "curry leaves", text: "Karryblade" },
  { key: 89, value: "coconut milk", text: "Kokosmælk" },
  { key: 90, value: "ghee", text: "Ghee" },
  { key: 91, value: "avocado", text: "Avocado" },
  { key: 92, value: "tomatoes", text: "Tomater" },
  { key: 93, value: "onion", text: "Løg" },
  { key: 94, value: "garlic", text: "Hvidløg" },
  { key: 95, value: "jalapeno peppers", text: "Jalapeno peber" },
  { key: 96, value: "cilantro", text: "Koriander" },
  { key: 97, value: "limes", text: "Lime" },
  { key: 98, value: "black beans", text: "Sorte bønner" },
  { key: 99, value: "corn tortillas", text: "Majstortillas" },
  { key: 100, value: "queso fresco", text: "Queso fresco" },
];

const typeOptions = [
  { key: 0, value: "fancy food", text: "Fancy" },
  { key: 1, value: "american", text: "Amerikansk" },
  { key: 2, value: "chinese", text: "Kinesisk" },
  { key: 3, value: "french", text: "Fransk" },
  { key: 4, value: "indian", text: "Indisk" },
  { key: 5, value: "italian", text: "Italiensk" },
  { key: 6, value: "japanese", text: "Japansk" },
  { key: 7, value: "korean", text: "Koreansk" },
  { key: 8, value: "mexican", text: "Mexicansk" },
  { key: 9, value: "thai", text: "Thailandsk" },
  { key: 10, value: "vietnamese", text: "Vietnamesisk" },
  { key: 11, value: "mediterranean", text: "Middelhavskøkkenet" },
  { key: 12, value: "middle eastern", text: "Mellemøstlig" },
  { key: 13, value: "spanish", text: "Spansk" },
  { key: 14, value: "indonesian", text: "Indonesisk" },
  { key: 15, value: "greek", text: "Græsk" },
  { key: 16, value: "cajun", text: "Cajun" },
  { key: 17, value: "caribbean", text: "Caribisk" },
  { key: 18, value: "african", text: "Afrikansk" },
  { key: 19, value: "brazilian", text: "Brasiliansk" },
  { key: 20, value: "peruvian", text: "Peruviansk" },
  { key: 21, value: "argentinian", text: "Argentinsk" },
];

const MealGenieForm = () => {
  const store = useMealPlanStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    store.submitChatGpt();
  };

  const handleChangeIngredientValue = (data: DropdownProps, index: number) => {
    store.changeIngredientValue(data.value as string, index);
  };

  const handleChangeIngredientDays = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    store.changeIngredientDays(Number(event.target.value), index);
  };

  const handleChangeTypeValue = (data: DropdownProps, index: number) => {
    store.changeMealTypeValue(data.value as string, index);
  };

  const handleChangeTypeDays = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    store.changeMealTypeDays(Number(event.target.value), index);
  };

  return (
    <>
      <Card.Content>
        <Form onSubmit={handleSubmit}>
          <Form.Group widths={2}>
            <Form.Field
              label="Dage"
              type="number"
              control={Input}
              value={store.days}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                store.setDays(Number(event.target.value));
              }}
              name="days"
              required
              disabled={store.loading}
            />
            <Form.Field
              label="Personer"
              type="number"
              control={Input}
              value={store.persons}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                store.setPersons(Number(event.target.value));
              }}
              name="persons"
              required
              disabled={store.loading}
            />
          </Form.Group>
          <Form.Group inline>
            <label>Hvilke måltider?</label>
            <Form.Checkbox
              label="Morgen"
              control={Checkbox}
              checked={store.breakfast}
              onClick={store.toggleBreakfast}
              name="breakfast"
              disabled={store.loading}
            />
            <Form.Checkbox
              label="Middag"
              control={Checkbox}
              checked={store.lunch}
              onClick={store.toggleLunch}
              name="lunch"
              disabled={store.loading}
            />
            <Form.Checkbox
              label="Aften"
              control={Checkbox}
              checked={store.dinner}
              onClick={store.toggleDinner}
              name="dinner"
              disabled={store.loading}
            />
          </Form.Group>
          <Form.Group inline>
            <label>Særlige kostpræferencer?</label>
            <Form.Radio
              label="Ingen"
              checked={store.preferences == null}
              onClick={() => store.setPreferences(undefined)}
              name="preferences"
              disabled={store.loading}
            />
            <Form.Radio
              label="Vegetar"
              checked={store.preferences === "vegetarian"}
              onClick={() => store.setPreferences("vegetarian")}
              name="preferences"
              disabled={store.loading}
            />
            <Form.Radio
              label="Veganer"
              checked={store.preferences === "vegan"}
              value="vegan"
              onClick={() => store.setPreferences("vegan")}
              name="preferences"
              disabled={store.loading}
            />
          </Form.Group>
          <Divider></Divider>
          <Button
            onClick={store.addIngredient}
            color="blue"
            disabled={store.loading}
          >
            <Icon name="plus"></Icon> Tilføj ingrediens
          </Button>
          {store.ingredients.length > 0 ? (
            <Header
              as="h6"
              content="Jeg vil gerne have INGREDIENS i mindst DAGE"
            ></Header>
          ) : (
            <></>
          )}
          {store.ingredients.map((ingredient, index) => (
            <>
              <Divider hidden></Divider>
              <Form.Group widths={2}>
                <Form.Select
                  fluid
                  label="Ingrediens"
                  options={ingredientOptions}
                  value={ingredient.value}
                  onChange={(_: any, props: DropdownProps) =>
                    handleChangeIngredientValue(props, index)
                  }
                  name="value"
                  required
                  disabled={store.loading}
                />
                <Form.Field
                  error={(ingredient.days ?? 0) > (store.days ?? 0)}
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
                  disabled={store.loading}
                />
                <Button
                  className="delete-btn"
                  icon="x"
                  compact
                  onClick={() => store.deleteIngredient(index)}
                  disabled={store.loading}
                ></Button>
              </Form.Group>
            </>
          ))}
          <Divider></Divider>
          <Button
            onClick={store.addMealType}
            color="blue"
            disabled={store.loading}
          >
            <Icon name="plus"></Icon>Tilføj Type
          </Button>
          {store.types.length > 0 ? (
            <Header
              as="h6"
              content="Jeg vil gerne have DAGE har TYPE ret"
            ></Header>
          ) : (
            <></>
          )}
          {store.types.map((type, index) => (
            <>
              <Divider hidden></Divider>
              <Form.Group widths={2}>
                <Form.Select
                  fluid
                  label="Type"
                  options={typeOptions}
                  value={type.value}
                  onChange={(_: any, props: DropdownProps) =>
                    handleChangeTypeValue(props, index)
                  }
                  name="value"
                  required
                  disabled={store.loading}
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
                  disabled={store.loading}
                />
                <Button
                  className="delete-btn"
                  icon="x"
                  compact
                  onClick={() => store.deleteMealType(index)}
                  disabled={store.loading}
                ></Button>
              </Form.Group>
            </>
          ))}
          <Divider></Divider>
          <Form.Field
            type="submit"
            control={Button}
            color="blue"
            loading={store.loading}
            disabled={store.loading}
          >
            Opret madplan
          </Form.Field>
        </Form>
      </Card.Content>
    </>
  );
};

export default MealGenieForm;
