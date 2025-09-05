import ContactLinks from "./components/ContactLinks/ContactLinks.tsx";
import Content from "./components/Content/Content.tsx";
import Header from "./components/Header/Header.tsx";
import Tabs from "./components/Tabs/Tabs.tsx";
import TabGroup from "./components/Tabs/TabGroup.tsx";
import TabContent from "./components/Tabs/TabContent.tsx";
import Products from "./tabs/Products/Products.tsx";
import Footer from "./components/Footer/Footer.tsx";

import { contactLinks } from "./data/contacts.tsx";
import { tabs } from "./data/tabs.tsx";
import { products } from "./data/products.tsx";

import { useEffect, useRef, useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const tabGroupRef = useRef<HTMLDivElement>(null);

  // 处理触摸滑动，切换 activeTab
  useEffect(() => {
    const tabGroup = tabGroupRef.current;
    if (!tabGroup) return;

    let startX = 0, startY = 0, startScrollY = 0;

    const handleTouchStart = ({ touches }: TouchEvent) => {
      const { pageX, pageY } = touches[0];
      startX = pageX;
      startY = pageY;
      startScrollY = window.scrollY;
    };

    const handleTouchEnd = ({ changedTouches }: TouchEvent) => {
      if (window.scrollY !== startScrollY) return;

      const { pageX: endX, pageY: endY } = changedTouches[0];
      const angX = endX - startX;
      const angY = endY - startY;

      const distance = Math.sqrt(angX * angX + angY * angY);
      if (distance < 50) return;

      const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
      if (currentIndex === -1) return;

      const angle = Math.atan2(angY, angX) * 180 / Math.PI;
      const isLeftSwipe = angle >= 160 || angle <= -160;
      const isRightSwipe = angle >= -20 && angle <= 20;

      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].value);
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].value);
      }
    }

    tabGroup.addEventListener('touchstart', handleTouchStart);
    tabGroup.addEventListener('touchend', handleTouchEnd);

    return () => {
      tabGroup.removeEventListener('touchstart', handleTouchStart);
      tabGroup.removeEventListener('touchend', handleTouchEnd);
    }
  }, [activeTab]);

  return (
    <main>
      <ContactLinks links={contactLinks}/>
      <Content>
        <Header />
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <TabGroup activeTab={activeTab} containerRef={tabGroupRef}>
          {tabs.map((tab) => (
            <TabContent key={tab.value} value={tab.value} onClick={() => {
              setActiveTab(tab.value)
            }}>
              {tab.content}
            </TabContent>
          ))}
        </TabGroup>
        <Products products={products} />
        <Footer />
      </Content>
    </main>
  )
}

export default App;