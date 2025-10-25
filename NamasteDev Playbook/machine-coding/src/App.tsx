import Checkboxes from "./components/checkboxes/Checkboxes";
import { CheckboxData } from "./components/checkboxes/data";

const App = () => {
	return (
		<div>
			<Checkboxes data={CheckboxData} />
		</div>
	);
};

export default App;
