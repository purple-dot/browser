import murmurhash from "murmurhash";

export type BooleanFlagConfig = {
	type: "boolean";
	flag: string;
	enabled: boolean;
};

export type VariationFlagConfig = {
	type: "variation";
	flag: string;
	variations: {
		variation: string;
		weight: number;
	}[];
};

export type FlagConfig = BooleanFlagConfig | VariationFlagConfig;

export class FeatureFlags {
	private flagConfig: FlagConfig[];
	private readonly userId: string;

	constructor(flagConfig: FlagConfig[], userId: string) {
		this.userId = userId;
		assert(this.userId.length > 0, "Must provide a userId string");

		this.flagConfig = flagConfig;
	}

	isEnabled(flag: string): boolean {
		const config = this.findFlagConfig(flag, "boolean");
		if (!config) {
			return false;
		}
		return config.enabled;
	}

	variation(flag: string): string | undefined {
		const config = this.findFlagConfig(flag, "variation");
		if (!config) {
			return undefined;
		}
		const rand = this.randomVariationForFlag(flag);
		return weightedChoice(config.variations, rand);
	}

	allVariations() {
		return Object.fromEntries(
			this.flagConfig
				.filter((f) => f.type === "variation")
				.map((f) => [f.flag, this.variation(f.flag)] as const),
		);
	}

	updateFlagConfig(config: FlagConfig) {
		const idx = this.flagConfig.findIndex((f) => f.flag === config.flag);
		if (idx >= 0) {
			this.flagConfig[idx] = config;
		} else {
			this.flagConfig.push(config);
		}
	}

	resetFlagConfig() {
		this.flagConfig = [];
	}

	private randomVariationForFlag(flag: string) {
		const randSeed = `${this.userId}:${flag}`;
		return normalizedHashCode(randSeed);
	}

	private findFlagConfig<T extends FlagConfig["type"]>(
		flag: string,
		type: T,
	): Extract<FlagConfig, { type: T }> | undefined {
		return this.flagConfig.find(
			(f: FlagConfig) => f.flag === flag && f.type === type,
		) as Extract<FlagConfig, { type: T }> | undefined;
	}
}

function weightedChoice(
	choices: { variation: string; weight: number }[],
	r: number,
) {
	const totalWeight = sum(choices.map(({ weight }) => weight));
	let s = r * totalWeight;

	for (const { variation, weight } of choices) {
		if (s < weight) {
			return variation;
		}
		s -= weight;
	}
}

function sum(xs: number[]) {
	return xs.reduce((acc, x) => acc + x, 0);
}

function assert(exp: boolean, msg: string) {
	if (!exp) {
		throw new Error(msg);
	}
}

function normalizedHashCode(s: string) {
	const hash = murmurhash.v3(s);
	return hash / 0xffffffff; // Normalize to range [0,1]
}
