// import UseStateHook from "./hooks/UseStateHook";
// import UseEffectHook from "./hooks/03.UseEffectHook";
// import UseContextHook from "./hooks/04.UseContextHook";
import { useState } from "react";
import { AppContext } from "./AppContext";
import UseRefHook from "./hooks/05.UseRefHook"
import UseMemoHook from "./hooks/06.UseMemoHook"

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
			{/* <UseContextHook /> */}
			{/* <UseRefHook /> */}
			<UseMemoHook />
		</AppContext.Provider>
	);
};

export default App;
