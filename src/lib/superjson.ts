import { superjson } from "@biochain/chain-effect"
import { Amount, type AmountJSON } from "@/types/amount"

superjson.registerCustom<Amount, AmountJSON>(
  {
    isApplicable: (value): value is Amount => value instanceof Amount,
    serialize: (value) => value.toJSON(),
    deserialize: (value) => Amount.fromJSON(value),
  },
  "Amount"
)
