// import UseStateHook from "./hooks/UseStateHook";
// import UseEffectHook from "./hooks/03.UseEffectHook";
import { useState } from "react";
import { AppContext } from "./AppContext";
import UseContextHook from "./hooks/04.UseContextHook";

export type Data = {
	firstName: string;
	lastName: string;
	email: string;
};

const App = () => {
	const [data, setData] = useState<Data>({
		firstName: "Rupam",
		lastName: "Das",
		email: "rejisterjack@gmail.com",
	});
  
	return (
		<AppContext.Provider value={{ data, setData }}>
			{/* <UseStateHook /> */}
			{/* <UseEffectHook /> */}
			<UseContextHook />
		</AppContext.Provider>
	);
};

export default App;
