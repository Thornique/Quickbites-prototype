import { Price } from "@/components/ui/price";
import { Tag, TAG_KINDS } from "@/components/ui/tag";
import { VegMark } from "@/components/ui/veg-mark";
import { Panel, Row } from "../_components/panel";

/** Primitives that only exist because this is an Indian food app. */
export function FoodSection() {
  return (
    <Panel
      id="food"
      title="Food primitives"
      note="Veg/non-veg marks, price formatting and item tags — the details that make a menu read like a real Indian cafe."
    >
      <Row label="Veg mark">
        <VegMark isVeg size="sm" />
        <VegMark isVeg />
        <VegMark isVeg size="lg" />
        <VegMark isVeg withLabel />
      </Row>
      <Row label="Non-veg mark">
        <VegMark isVeg={false} size="sm" />
        <VegMark isVeg={false} />
        <VegMark isVeg={false} size="lg" />
        <VegMark isVeg={false} withLabel />
      </Row>

      <Row label="Price">
        <Price value={99} />
        <Price value={249} size="lg" />
        <Price value={1249} size="xl" />
      </Row>
      <Row label="Discounted">
        <Price value={199} compareAt={249} />
        <Price value={199} compareAt={249} showSavingPercent />
        <Price value={99} compareAt={149} size="lg" showSavingPercent />
      </Row>

      <Row label="Tags">
        {TAG_KINDS.map((kind) => (
          <Tag key={kind} kind={kind} />
        ))}
      </Row>
      <Row label="Tags (dense)">
        {TAG_KINDS.map((kind) => (
          <Tag key={kind} kind={kind} iconless />
        ))}
      </Row>
      <Row label="Tags (Hindi)">
        <Tag kind="bestseller" label="सबसे लोकप्रिय" />
        <Tag kind="new" label="नया" />
        <Tag kind="spicy" label="तीखा" />
        <Tag kind="customisable" label="अपनी पसंद से" />
      </Row>
    </Panel>
  );
}
