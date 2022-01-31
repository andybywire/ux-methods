import React, { useEffect, useState } from "react";
import getIt from "get-it";
import jsonResponse from "get-it/lib/middleware/jsonResponse";
import promise from "get-it/lib/middleware/promise";
import { DashboardWidget } from "@sanity/dashboard";
import { Button, Flex, Card, Code } from "@sanity/ui";
import styled from "styled-components";

const request = getIt([promise(), jsonResponse()]);

const Image = styled.img`
  display: block;
  width: 100%;
`;

function Cats() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const getCat = () => {
    setIsLoading(true);
    request({ url: "https://api.thecatapi.com/v1/images/search" })
      .then((response) => {
        const imageUrl = response.body[0].url;
        setImageUrl(imageUrl);
        setIsLoading(false);
      })
      .catch((error) => setError(error) && setIsLoading(false));
  };

  useEffect(() => {
    getCat();
  }, []);

  return (
    <DashboardWidget
      header="A cat"
      footer={
        <Flex direction="column" align="stretch">
          <Button
            flex={1}
            paddingX={2}
            paddingY={4}
            mode="bleed"
            tone="primary"
            text="Get new cat"
            loading={isLoading}
            onClick={getCat}
          />
        </Flex>
      }
    >
      {error && (
        <Card paddingX={3} paddingY={4} tone="critical">
          <Code>{JSON.stringify(error, null, 2)}</Code>
        </Card>
      )}
      {!error && (
        <figure>
          <Image src={imageUrl} />
        </figure>
      )}
    </DashboardWidget>
  );
}

export default {
  name: "cats",
  component: Cats,
};
