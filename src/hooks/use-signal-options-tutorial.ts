import { createEffect, createSignal, type SignalOptions } from 'solid-js'
import type { EqualsProfile } from '../types/app'

const equalsProfileSignalOptions: SignalOptions<EqualsProfile> = {
  name: 'equalsProfile',
  equals: (prev, next) => prev.version === next.version,
}

const equalsNotificationCountSignalOptions: SignalOptions<number> = {
  name: 'equalsNotificationCount',
}

const equalsManualReadSignalOptions: SignalOptions<string> = {
  name: 'equalsManualRead',
}

const subscriptionEventsSignalOptions: SignalOptions<string[]> = {
  name: 'subscriptionEvents',
  ownedWrite: true,
}

const ownedWriteMetaSignalOptions: SignalOptions<string> = {
  name: 'ownedWriteMeta',
  ownedWrite: true,
}

export const useSignalOptionsTutorial = () => {
  const [equalsProfile, setEqualsProfile] = createSignal<EqualsProfile>(
    {
      version: 1,
      label: 'Initial label',
    },
    equalsProfileSignalOptions,
  )
  const [equalsNotificationCount, setEqualsNotificationCount] = createSignal(
    0,
    equalsNotificationCountSignalOptions,
  )
  const [equalsManualRead, setEqualsManualRead] = createSignal(
    'ยังไม่ได้อ่านแบบ manual',
    equalsManualReadSignalOptions,
  )

  createEffect(
    () => equalsProfile(),
    () => {
      setEqualsNotificationCount((prev) => prev + 1)
    },
    { defer: true },
  )

  const [subscriptionPreviewVisible, setSubscriptionPreviewVisible] =
    createSignal(true)
  const [subscriptionEvents, setSubscriptionEvents] = createSignal<string[]>(
    ['Preview subscriber is mounted.'],
    subscriptionEventsSignalOptions,
  )

  const appendSubscriptionEvent = (message: string) => {
    setSubscriptionEvents((prev) => [...prev, message])
  }

  const handlePreviewSignalUnobserved = () => {
    appendSubscriptionEvent(
      'unobserved fired: trackedPreviewValue has no subscribers left.',
    )
  }

  const trackedPreviewSignalOptions: SignalOptions<number> = {
    name: 'trackedPreviewValue',
    unobserved: handlePreviewSignalUnobserved,
  }

  const [trackedPreviewValue, setTrackedPreviewValue] = createSignal(
    1,
    trackedPreviewSignalOptions,
  )

  const [ownedWriteSourceCount, setOwnedWriteSourceCount] = createSignal(1, {
    name: 'ownedWriteSourceCount',
  })
  const [ownedWriteMeta, setOwnedWriteMeta] = createSignal(
    'derived has not been read yet',
    ownedWriteMetaSignalOptions,
  )
  const [ownedWriteDerivedCount] = createSignal<number>(
    (prev) => {
      const nextValue = ownedWriteSourceCount() * 2
      const previousValueText = prev === undefined ? 'none' : String(prev)

      setOwnedWriteMeta(
        `source=${ownedWriteSourceCount()}, next=${nextValue}, prev=${previousValueText}`,
      )

      return nextValue
    },
    {
      name: 'ownedWriteDerivedCount',
    },
  )

  const handleEqualsWriteSameVersion = () => {
    setEqualsProfile((prev) => ({
      version: prev.version,
      label: `Hidden update at version ${prev.version}`,
    }))
  }

  const handleEqualsBumpVersion = () => {
    setEqualsProfile((prev) => ({
      version: prev.version + 1,
      label: `Visible update at version ${prev.version + 1}`,
    }))
  }

  const handleEqualsManualRead = () => {
    setEqualsManualRead(
      `Manual read sees: "${equalsProfile().label}" (version ${equalsProfile().version})`,
    )
  }

  const handleEqualsReset = () => {
    setEqualsProfile({
      version: 1,
      label: 'Initial label',
    })
    setEqualsManualRead('ยังไม่ได้อ่านแบบ manual')
  }

  const handleTrackedPreviewIncrement = () => {
    setTrackedPreviewValue((prev) => prev + 1)
    appendSubscriptionEvent('trackedPreviewValue updated from button click.')
  }

  const handleToggleSubscriptionPreview = () => {
    setSubscriptionPreviewVisible((prev) => !prev)
  }

  const handleSubscriptionReset = () => {
    setTrackedPreviewValue(1)
    setSubscriptionPreviewVisible(true)
    setSubscriptionEvents(['Preview subscriber is mounted.'])
  }

  const handleOwnedWriteAdvance = () => {
    setOwnedWriteSourceCount((prev) => prev + 1)
  }

  const handleOwnedWriteReset = () => {
    setOwnedWriteSourceCount(1)
    setOwnedWriteMeta('derived has not been read yet')
  }

  return {
    equalsManualRead,
    equalsNotificationCount,
    equalsProfile,
    handleEqualsBumpVersion,
    handleEqualsManualRead,
    handleEqualsReset,
    handleEqualsWriteSameVersion,
    handleOwnedWriteAdvance,
    handleOwnedWriteReset,
    handleSubscriptionReset,
    handleToggleSubscriptionPreview,
    handleTrackedPreviewIncrement,
    ownedWriteDerivedCount,
    ownedWriteMeta,
    ownedWriteSourceCount,
    subscriptionEvents,
    subscriptionPreviewVisible,
    trackedPreviewValue,
  }
}
