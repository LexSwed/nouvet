import { expect, test } from "../fixtures/users";

test.describe("User 1 is a new user", () => {
	test("can create pets", async ({ userOnePage: page }) => {
		page.goto("/app");
		console.log("Has initial pet creation form expanded");
		await expect(page.getByLabel("Add your pet")).toBeVisible();

		const form = page.getByLabel("Add your pet");
		await form.getByLabel("Name").fill("Garfield");
		console.log("Select animal type");
		await page.keyboard.press("Tab");
		console.log("Switch to cat");
		await page.keyboard.press("ArrowRight");
		console.log("Switch to gender");
		await page.keyboard.press("Tab");
		console.log("Select male");
		await page.keyboard.press(" "); // space
		console.log("Press Create");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Enter");

		await expect(page.getByLabel("Your pets")).toBeVisible();
		await expect(page.getByRole("button", { name: "Garfield" })).toBeVisible();
		console.log("Quick settings visible");
		await expect(page.getByRole("button", { name: "Burth date" })).toBeVisible();
	});

	test("can create family invites", async ({ userOnePage: page }) => {
		page.goto("/app");
		await page.waitForEvent("load");

		console.log("Has family invitation message");
		const newPetFamilyInvitationCta = page.getByRole("button", {
			name: "Have your partner already registered? Join them!",
		});
		await expect(newPetFamilyInvitationCta).toBeVisible();

		console.log("Opens family invite dialog on QR scan page");
		await newPetFamilyInvitationCta.click();
		await expect(page.getByRole("dialog", { name: "Join another user" })).toBeVisible();
		await page
			.getByRole("dialog", { name: "Join another user" })
			.getByLabel("Close dialog")
			.click();

		console.log("Has default family invite window.");
		await page.getByRole("button", { name: "My Family" }).click();
		await expect(
			page.getByRole("dialog", { name: "Family invitation" }).getByText("Sharing is caring"),
		).toBeVisible();
		await page.getByRole("dialog", { name: "Family invitation" }).getByText("Invite").click();
		await expect(page.getByRole("dialog", { name: "Create invite" })).toBeFocused();
		await expect(
			page
				.getByRole("dialog", { name: "Create invite" })
				.getByRole("button", { name: "Create QR code" }),
		).toBeVisible();

		console.log("Can create invites and share them");
		page
			.getByRole("dialog", { name: "Create invite" })
			.getByRole("button", { name: "Create QR code" })
			.click();
		await expect(page.getByText(/The invitation expires in [\d]+ minutes/)).toBeVisible();
	});
});
