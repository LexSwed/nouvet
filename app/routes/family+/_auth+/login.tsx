import { Button } from "~/lib/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/lib/ui/card.tsx";

export default function LoginRoute() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<h1>Log In</h1>
					<CardDescription>Enter to your family</CardDescription>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Button asChild>
					<a href="/family/auth/facebook">Sign in with GitHub</a>
				</Button>
			</CardContent>
		</Card>
	);
}
