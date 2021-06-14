<template>
  <div class="grid grid-cols-max-2 sm:grid-cols-max-4 justify-center">
    <div v-for="(artifact, artifactIndex) in artifactSet.artifacts" :key="artifactIndex">
      <tippy
        tag="div"
        class="h-32 w-32 mx-2 my-2 relative rounded-full"
        :class="rarityBgClass(artifact.afxRarity) || 'bg-gray-200'"
      >
        <img
          class="absolute top-0 left-0 h-full w-full z-10"
          :src="iconURL(artifact.iconPath, 256)"
        />
        <img
          v-for="(stone, stoneIndex) in artifact.stones.slice().reverse()"
          :key="stoneIndex"
          class="Artifact__stone z-20"
          :src="iconURL(stone.iconPath, 128)"
        />

        <template #content>
          <div class="space-y-2">
            <div>
              <div class="font-medium">
                <img :src="iconURL(artifact.iconPath)" class="inline h-4 w-4 relative -top-px" />
                {{ artifact.name }}
                <span v-if="artifact.afxRarity > 0" :class="rarityFgClass(artifact.afxRarity)">
                  {{ artifact.rarity }}
                </span>
              </div>
              <div>
                <span class="text-green-300">{{ artifact.effectSize }}</span>
                {{ artifact.effectTarget }}
              </div>
            </div>

            <div v-for="(stone, stoneIndex) in artifact.stones" :key="stoneIndex">
              <div>
                <img :src="iconURL(stone.iconPath)" class="inline h-4 w-4 relative -top-px" />
                {{ stone.name }}
              </div>
              <div>
                <span class="text-green-300">{{ stone.effectSize }}</span>
                {{ stone.effectTarget }}
              </div>
            </div>
          </div>
        </template>
      </tippy>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Tippy } from 'vue-tippy';

import { ArtifactSet, ei, iconURL } from 'lib';

export default defineComponent({
  components: {
    Tippy,
  },
  props: {
    artifactSet: {
      type: Object as PropType<ArtifactSet>,
      required: true,
    },
  },
  setup() {
    const rarityFgClass = (afxRarity: ei.ArtifactSpec.Rarity): string => {
      switch (afxRarity) {
        case ei.ArtifactSpec.Rarity.COMMON:
          return '';
        case ei.ArtifactSpec.Rarity.RARE:
          return 'text-rare';
        case ei.ArtifactSpec.Rarity.EPIC:
          return 'text-epic';
        case ei.ArtifactSpec.Rarity.LEGENDARY:
          return 'text-legendary';
      }
    };
    const rarityBgClass = (afxRarity: ei.ArtifactSpec.Rarity): string => {
      switch (afxRarity) {
        case ei.ArtifactSpec.Rarity.COMMON:
          return '';
        case ei.ArtifactSpec.Rarity.RARE:
          return 'bg-rare';
        case ei.ArtifactSpec.Rarity.EPIC:
          return 'bg-epic';
        case ei.ArtifactSpec.Rarity.LEGENDARY:
          return 'bg-legendary';
      }
    };
    return {
      rarityFgClass,
      rarityBgClass,
      iconURL,
    };
  },
});
</script>

<style scoped>
.text-rare {
  color: #2d77ee;
}

.text-epic {
  color: #b601ea;
}

.text-legendary {
  color: #fc9901;
}

.bg-rare {
  background: radial-gradient(#b3ffff, #b3ffff, #6ab6ff);
}

.bg-epic {
  background: radial-gradient(#ff40ff, #ff40ff, #c03fe2);
}

.bg-legendary {
  background: radial-gradient(#fffe41, #fffe41, #eeab42);
}

img.Artifact__stone {
  position: absolute;
  bottom: 7%;
  height: 17%;
  width: 17%;
  filter: drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white) drop-shadow(1px 0 0 white)
    drop-shadow(-1px 0 0 white);
}

img.Artifact__stone:nth-child(2) {
  right: 7%;
}

img.Artifact__stone:nth-child(3) {
  right: 24%;
}

img.Artifact__stone:nth-child(4) {
  right: 41%;
}
</style>