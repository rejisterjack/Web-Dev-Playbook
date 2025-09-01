import { useContext } from "react";
import type { Data } from "../App";
import { AppContext } from "../AppContext";

const UseContextHook = () => {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error(
			"UseContextHook must be used within an AppContext.Provider",
		);
	}

	const { data, setData } = context;
	return (
		<div>
			<h1>
				{data.firstName} {data.lastName}
			</h1>
			<input
				className="form-control"
				type="text"
				value={data.firstName}
				onChange={(e) =>
					setData((prevData: Data) => ({
						...prevData,
						firstName: e.target.value,
					}))
				}
			/>
			<input
				className="form-control"
				type="text"
				value={data.lastName}
				onChange={(e) =>
					setData((prevData: Data) => ({
						...prevData,
						lastName: e.target.value,
					}))
				}
			/>
		</div>
	);
};

export default UseContextHook;
