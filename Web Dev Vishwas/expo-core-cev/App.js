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
        <Text>
          {" "}
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minima eaque
          amet voluptatum possimus pariatur ex veniam iure quisquam ipsam
          voluptas harum inventore ad aliquam velit, quibusdam modi sint
          asperiores fuga natus culpa quae ab ratione qui architecto? Corrupti
          nihil, excepturi delectus officiis, quisquam recusandae ipsam fuga
          omnis dignissimos libero eum facere totam eaque obcaecati praesentium
          alias cum illo est earum! Non neque aliquid molestiae. Saepe, sunt
          voluptas facilis mollitia aliquid quidem eaque enim consequuntur
          impedit, perferendis voluptate? Ullam, minima aliquam vitae minus
          obcaecati deserunt possimus quibusdam voluptatibus, sed dicta in
          fugit, facere neque atque? Non dolor dolorum assumenda voluptates
          iure! Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Consequatur animi laboriosam est voluptatum at enim voluptatibus nam
          officia. Tenetur earum quibusdam quas, pariatur est, cum error dolor
          in non nostrum debitis voluptates odio autem voluptatum suscipit atque
          a quam voluptate id. Nulla asperiores inventore voluptate minus
          exercitationem vero dicta nisi quidem debitis repellendus magni
          tempora ipsam culpa velit, iusto magnam deserunt libero. Delectus
          harum et, quis magnam veritatis assumenda facilis pariatur quibusdam,
          voluptates nobis saepe atque quod officia? Vero assumenda quia
          perferendis praesentium nam accusantium ad minima labore, voluptates,
          magni numquam exercitationem tenetur quidem voluptatum repellat quo
        </Text>
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
