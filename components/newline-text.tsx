import { Divider, Header } from "semantic-ui-react";

export default function NewlineText(props: { text: string | string[] }) {
  const text = props.text;
  if (Array.isArray(text)) {
    return (
      <>
        {text.map((str) => {
          if (typeof str === "string") {
            return <p key={str}>{str}</p>;
          } else {
            return JSON.stringify(str)
              .trim()
              .replaceAll("{", "")
              .replaceAll("}", "")
              .replaceAll("[", "")
              .replaceAll("]", "")
              .replaceAll(":", "\n")
              .replaceAll('",', "\n")
              .replaceAll('"', "")
              .split("\n")
              .map((str) => <p key={str}>{str}</p>);
          }
        })}
      </>
    );
  }

  if (text.split != null) {
    const newText = text
      .split("\n")
      .map((str) =>
        str === "" ? (
          <Divider key={str} hidden></Divider>
        ) : (
          str.includes(':') ? <Header as={'h4'} key={str}>{str}</Header> : <p key={str}>{str}</p>
        )
      );

    return <>{newText}</>;
  }

  return <>{text}</>;
}
