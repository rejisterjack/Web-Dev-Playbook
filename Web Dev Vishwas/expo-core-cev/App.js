import { View, Text, Image, ScrollView, Button } from "react-native"
import React from "react"
const logoImg = require("./assets/adaptive-icon.png")

const App = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "plum" }}>
      <View style={{ width: 200, height: 200, backgroundColor: "lightblue" }}>
        <Text>React Native</Text>
      </View>
      <View style={{ width: 200, height: 200, backgroundColor: "lightcoral" }}>
        <Image source={logoImg} style={{ width: 200, height: 200 }} />
      </View>
      <View style={{ width: 200, height: 200, backgroundColor: "lightcoral" }}>
        <Image
          source={{ uri: "https://picsum.photos/200" }}
          style={{ width: 200, height: 200 }}
        />
      </View>
      <ScrollView>
        <Text>hello world</Text>
      </ScrollView>
      <View style={{ width: 200, height: 200, backgroundColor: "lightcoral" }}>
        <Image
          source={{ uri: "https://picsum.photos/200" }}
          style={{ width: 200, height: 200 }}
        />
      </View>
      <Button
        title="Click Me"
        onPress={() => alert("Button Clicked")}
        color="midnightblue"
      />

      {/* Pressable */}
    </ScrollView>
  )
}

export default App
