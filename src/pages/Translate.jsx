import React, { useState } from 'react';
import axios from 'axios';

const ExampleComponent = () => {
  const [response, setResponse] = useState(null);

  const handleClick = async () => {
    try {
      const res = await axios.post('https://translate-divesync.azurewebsites.net', {
        text: "Hello, this is a test translation."
      });
      setResponse(res.data);
    } catch (error) {
      setResponse(error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Get Translation</button>
      {response && (
        <pre>{JSON.stringify(response, null, 2)}</pre>
      )}
    </div>
  );
};

export default ExampleComponent;
