import type { FC } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthWrapper: FC = () => {
	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		toast("Connect Supabase to enable authentication.");
	};

	return (
		<div className="min-h-screen grid place-items-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center">Welcome back</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="signin">
						<TabsList className="grid grid-cols-2 w-full">
							<TabsTrigger value="signin">Sign in</TabsTrigger>
							<TabsTrigger value="signup">Sign up</TabsTrigger>
						</TabsList>

						<TabsContent value="signin">
							<form className="space-y-3 mt-4" onSubmit={onSubmit}>
								<Input type="email" placeholder="Email" required />
								<Input type="password" placeholder="Password" required />
								<Button type="submit" className="w-full">
									Sign in
								</Button>
							</form>
						</TabsContent>

						<TabsContent value="signup">
							<form className="space-y-3 mt-4" onSubmit={onSubmit}>
								<Input type="text" placeholder="Name" required />
								<Input type="email" placeholder="Email" required />
								<Input type="password" placeholder="Password" required />
								<Button type="submit" className="w-full">
									Create account
								</Button>
							</form>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
};

export default AuthWrapper;
