import { useState } from "react";

const initialCount = ()=>{
  console.log("initial count")
  return 0
}

const UseStateHook = () => {
	// const [count, setCount] = useState(initialCount());
	const [count, setCount] = useState(()=>initialCount());

	const handleCount = (val: number) => setCount((prevCount) => prevCount + val);
	return (
		<div>
			<div className="d-flex gap-4 p-4">
				<button
					className="btn btn-primary"
					type="button"
					onClick={() => handleCount(-1)}
				>
					-
				</button>
				<h1>{count}</h1>
				<button
					className="btn btn-primary"
					type="button"
					onClick={() => handleCount(+1)}
				>
					+
				</button>
			</div>
		</div>
	);
};

export default UseStateHook;
