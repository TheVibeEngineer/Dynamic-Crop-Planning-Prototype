import CropPlanningApp from '@/components/CropPlanningApp'

export default function Home() {
  return (
    <div suppressHydrationWarning={true}>
      <CropPlanningApp />
    </div>
  )
}