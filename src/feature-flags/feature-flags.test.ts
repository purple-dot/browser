import { describe, expect, it } from "vitest";
import { FeatureFlags, type FlagConfig } from "./feature-flags";

describe("FeatureFlags", () => {
	const userId = "user_1";

	it("returns undefined for an unknown feature flag", () => {
		const ff = new FeatureFlags([], userId);

		expect(ff.variation("UNKNOWN_FLAG")).toBeUndefined();
	});

	it("returns a variation for a flag configured with a single variant for 100% users", () => {
		const ff = new FeatureFlags(
			[
				{
					type: "variation" as const,
					flag: "FOO",
					variations: [{ variation: "foo", weight: 1 }],
				},
			],
			userId,
		);

		expect(ff.variation("FOO")).toEqual("foo");
	});

	it("returns a variation for a flag configured with two variants where one is for 100% users", () => {
		const ff = new FeatureFlags(
			[
				{
					type: "variation" as const,
					flag: "FOO",
					variations: [
						{ variation: "foo", weight: 0 },
						{ variation: "bar", weight: 1 },
					],
				},
			],
			userId,
		);

		expect(ff.variation("FOO")).toEqual("bar");
	});

	it("returns a random variation based on the userId for a 50/50 flag", () => {
		const conf: FlagConfig[] = [
			{
				type: "variation" as const,
				flag: "FOO",
				variations: [
					{ variation: "foo", weight: 0.5 },
					{ variation: "bar", weight: 0.5 },
				],
			},
		];

		expect(new FeatureFlags(conf, "user_yyy").variation("FOO")).toEqual("foo");
		expect(new FeatureFlags(conf, "user_xxx").variation("FOO")).toEqual("bar");
	});

	it("returns variations for all flags for a given user", () => {
		const conf: FlagConfig[] = [
			{
				type: "variation" as const,
				flag: "FOO",
				variations: [
					{ variation: "foo", weight: 0.5 },
					{ variation: "bar", weight: 0.5 },
				],
			},
			{
				type: "boolean" as const,
				flag: "BAZ",
				enabled: true,
			},
			{
				type: "variation" as const,
				flag: "BAR",
				variations: [
					{ variation: "spam", weight: 0.5 },
					{ variation: "eggs", weight: 0.5 },
				],
			},
		];

		expect(new FeatureFlags(conf, userId).allVariations()).toEqual({
			FOO: "bar",
			BAR: "eggs",
		});
	});

	it("returns isEnabled true for boolean flags", () => {
		const conf: FlagConfig[] = [
			{
				type: "boolean" as const,
				flag: "FOO",
				enabled: true,
			},
		];

		expect(new FeatureFlags(conf, userId).isEnabled("FOO")).toEqual(true);
	});

	it("returns isEnabled false for variation flags", () => {
		const conf: FlagConfig[] = [
			{
				type: "variation" as const,
				flag: "FOO",
				variations: [
					{ variation: "foo", weight: 0.5 },
					{ variation: "bar", weight: 0.5 },
				],
			},
		];

		expect(new FeatureFlags(conf, userId).isEnabled("FOO")).toEqual(false);
	});

	it("returns undefined variation for a boolean flag", () => {
		const conf: FlagConfig[] = [
			{
				type: "boolean" as const,
				flag: "FOO",
				enabled: true,
			},
		];

		expect(new FeatureFlags(conf, "user_yyy").variation("FOO")).toEqual(
			undefined,
		);
	});
});
