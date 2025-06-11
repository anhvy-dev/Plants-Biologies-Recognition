import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as ort from "onnxruntime-web";

function App() {
  const [count, setCount] = useState(0);
  const [modelOutput, setModelOutput] = useState(null);

  useEffect(() => {
    const runModel = async () => {
      try {
        // Load ONNX model từ public folder
        const session = await ort.InferenceSession.create("best.onnx");

        // Ví dụ: tạo tensor input với 4 giá trị (tùy chỉnh nếu cần)
        const inputData = new Float32Array([0.5, 0.3, 0.8, 0.2]);
        const inputTensor = new ort.Tensor("float32", inputData, [1, 4]);

        const feeds = { images: inputTensor }; // "images" là tên input (cần chỉnh nếu sai)

        const results = await session.run(feeds);

        const outputName = Object.keys(results)[0];
        const outputData = results[outputName].data;

        setModelOutput(outputData);
        console.log("Model output:", outputData);
      } catch (err) {
        console.error("Error running model:", err);
      }
    };

    runModel();
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>SWD392</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
        {modelOutput && (
          <p>
            <strong>Model Output:</strong> {Array.from(modelOutput).join(", ")}
          </p>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
