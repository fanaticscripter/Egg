package consumption

import (
	_ "embed"
	"encoding/json"

	"github.com/pkg/errors"

	"github.com/fanaticscripter/Egg/wasmegg/_common/eiafx"
	"github.com/fanaticscripter/EggContractor/api"
)

//go:embed consumption-data.json
var _consumptionDataJSON []byte

var Outcomes []ConsumptionOutcome

type ConsumptionOutcome struct {
	Item                        Item                `json:"item"`
	ExpectedGold                float64             `json:"expected_gold"`
	ExpectedByproducts          []ExpectedByproduct `json:"expected_byproducts"`
	ExpectedFullConsumptionGold float64             `json:"expected_full_consumption_gold"`
	DemotionGold                *float64            `json:"demotion_gold"`
}

type Item struct {
	AfxId        api.ArtifactSpec_Name   `json:"afx_id"`
	AfxLevel     api.ArtifactSpec_Level  `json:"afx_level"`
	AfxRarity    api.ArtifactSpec_Rarity `json:"afx_rarity"`
	Id           string                  `json:"id"` // Not in original, must be populated.
	Name         string                  `json:"name"`
	TierNumber   int                     `json:"tier_number"`
	Rarity       string                  `json:"rarity"`
	IconFilename string                  `json:"icon_filename"` // Not in original, must be populated.
}

type ExpectedByproduct struct {
	Item
	ExpectedCount float64 `json:"expected_count"`
}

type Byproduct struct {
	Item
	Count int `json:"count"`
}

func LoadData() error {
	err := json.Unmarshal(_consumptionDataJSON, &Outcomes)
	if err != nil {
		return errors.Wrap(err, "error unmarshalling consumption-data.json")
	}
	for i, c := range Outcomes {
		c.Complete()
		Outcomes[i] = c
	}
	return nil
}

func (it *Item) Complete() {
	tier, err := eiafx.GetTier(&api.ArtifactSpec{Name: it.AfxId, Level: it.AfxLevel})
	if err != nil {
		panic(err)
	}
	it.Id = tier.Id
	it.IconFilename = tier.IconFilename
}

func (c *ConsumptionOutcome) Complete() {
	c.Item.Complete()
	for i, bp := range c.ExpectedByproducts {
		bp.Item.Complete()
		c.ExpectedByproducts[i] = bp
	}
}
