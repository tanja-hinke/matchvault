<script setup lang="ts">
const model = defineModel<string>({
  required: true,
})

withDefaults(defineProps<{
  id?: string
  label?: string
  includeAllOption?: boolean
  includeEmptyOption?: boolean
  allOptionLabel?: string
  emptyOptionLabel?: string
}>(), {
  id: 'format-select',
  label: 'Format',
  includeAllOption: false,
  includeEmptyOption: false,
  allOptionLabel: 'Alle Formate',
  emptyOptionLabel: 'Kein Format',
})

const { formatOptions } = useFormats()
</script>

<template>
  <div>
    <label
        :for="id"
        class="block text-sm font-bold text-slate-700"
    >
      {{ label }}
    </label>

    <select
        :id="id"
        v-model="model"
        :class="id === 'battle-log-format' ? 'h-[58px] mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950' : 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950'"
    >
      <option
          v-if="includeAllOption"
          value="all"
      >
        {{ allOptionLabel }}
      </option>

      <option
          v-if="includeEmptyOption"
          value=""
      >
        {{ emptyOptionLabel }}
      </option>

      <option
          v-for="format in formatOptions"
          :key="format.value"
          :value="format.value"
      >
        {{ format.label }}
      </option>
    </select>
  </div>
</template>