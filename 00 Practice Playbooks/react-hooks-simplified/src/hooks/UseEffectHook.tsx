import { useEffect, useState } from "react";

const UseEffectHook = () => {
	const [resourceType, setResourceType] = useState<
		"posts" | "users" | "comments"
	>("posts");
	const [data, setData] = useState([]);

	useEffect(() => {
		fetch(`https://jsonplaceholder.typicode.com/${resourceType}`)
			.then((res) => res.json())
			.then((json) => {
				setData(json);
			});
	}, [resourceType]);

	console.log(data.length, "data");

	return (
		<div>
			<div className="d-flex gap-4 p-4">
				<button
					className="btn-primary btn"
					type="button"
					onClick={() => setResourceType("posts")}
				>
					Posts
				</button>
				<button
					className="btn-primary btn"
					type="button"
					onClick={() => setResourceType("users")}
				>
					Users
				</button>
				<button
					className="btn-primary btn"
					type="button"
					onClick={() => setResourceType("comments")}
				>
					Comments
				</button>
			</div>

			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
};

export default UseEffectHook;
