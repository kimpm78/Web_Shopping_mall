import { RefObject, useCallback, useEffect, useRef, useState } from "react";
//무한 스크롤 hook
const useIntersection = (targetRef: RefObject<HTMLElement>) => {
  const observerRef = useRef<IntersectionObserver>()
  const [intersecting, setIntersecting] =useState(false)

  const getObserver = useCallback(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(entries => {
        setIntersecting(entries.some(entry => entry.isIntersecting))
      })
    }
    return observerRef.current
  },[observerRef.current]) 
  
  useEffect(() => {
    if (targetRef.current) getObserver().observe(targetRef.current)
  }, [targetRef.current])

  return intersecting
}

export default useIntersection