import formats from '~/data/formats.json'

export type FormatOption = {
    label: string
    value: string
}

export const useFormats = () => {
    const formatOptions = computed(() => formats as FormatOption[])

    const defaultFormat = computed(() => {
        return formatOptions.value[0]?.value ?? ''
    })

    const getFormatLabel = (value: string | null | undefined) => {
        if (!value) {
            return ''
        }

        return formatOptions.value.find((format) => format.value === value)?.label ?? value
    }

    return {
        formatOptions,
        defaultFormat,
        getFormatLabel,
    }
}