import React from "react";
import { Button, Card, Form, Input } from "semantic-ui-react";
import { useMealPlanStore } from "../lib/store";

const NemligForm = () => {
  const store = useMealPlanStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    store.submitNemlig();
  };

  return (
    <>
      <Card.Content>
        <Form onSubmit={handleSubmit} loading={store.nemligLoading}>
          <Form.Field
            label="Bruger"
            type="email"
            control={Input}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              store.setNemligUsername(event.target.value);
            }}
            name="user"
            required
          />
          <Form.Field
            label="Password"
            type="password"
            control={Input}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              store.setNemligPassword(event.target.value);
            }}
            name="pwd"
            required
          />
          <Form.Field control={Button}>Nemligfy!</Form.Field>
        </Form>
      </Card.Content>
    </>
  );
};

export default NemligForm;
