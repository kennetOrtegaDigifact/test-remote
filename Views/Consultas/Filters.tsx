import React, { useCallback } from 'react'
import { Filter } from '../../types'
import { View, Text, ScrollView } from 'react-native'
import { fonts, theme } from '../../Config/theme'
import { filterTagsProps } from '../../Config/dictionary'
type props={
    filters?: Filter
    country?: string
}
type tagProps={
    title?: string
}
const Tag: React.FC<tagProps> = ({ title = '' }:{title?:string}) => {
  return (
    <>
      <View style={{ backgroundColor: theme.orange, marginHorizontal: 5, paddingVertical: 5, paddingHorizontal: 15, borderRadius: 100 }}>
        <Text style={{ color: theme.graygreen, fontSize: fonts.normal, fontWeight: 'bold' }}>{title}</Text>
      </View>
    </>
  )
}
export const Filters: React.FC<props> = (props) => {
  const { filters = {}, country = '' } = props || {}
  const calculateFilters = useCallback((): string[] => {
    const tags: string[] = []
    filterTagsProps?.[country]?.keys?.forEach((key: string) => {
      if (filters?.[key as keyof typeof filters]?.toString()?.length) {
        tags.push(`${filterTagsProps?.[country]?.props?.[key]}${filters?.[key as keyof typeof filters]}`)
      }
    })
    return tags
  }, [filters, country])
  //   useEffect(() => {
  //     console.log('FILTROS', calculateFilters())
  //   }, [filters])
  return (
    <>
      <View style={{ marginVertical: 5 }}>
        <Text style={{ color: theme.graygreen, fontSize: fonts.normal, marginBottom: 2 }}>Filtros Aplicados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {calculateFilters().map((e, i) => <Tag key={i} title={e} />)}
        </ScrollView>
      </View>
    </>
  )
}
