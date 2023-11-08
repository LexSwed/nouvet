import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
	return [
		{ title: "NouVet" },
		{ name: "description", content: "Human routine for pets" },
	];
};

export default function IndexRoute() {
	return (
		<div className="container">
			<header>
				<h1 className="text-3xl">Welcome to Remix</h1>
			</header>
			<ul>
				<li>
					<a
						target="_blank"
						href="https://remix.run/tutorials/blog"
						rel="noreferrer"
					>
						15m Quickstart Blog Tutorial
					</a>
				</li>
				<li>
					<a
						target="_blank"
						href="https://remix.run/tutorials/jokes"
						rel="noreferrer"
					>
						Deep Dive Jokes App Tutorial
					</a>
				</li>
				<li>
					<a target="_blank" href="https://remix.run/docs" rel="noreferrer">
						Remix Docs
					</a>
				</li>
			</ul>
		</div>
	);
}
